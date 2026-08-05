#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

const SERVER_NAME = "fitliner-meta-ads";
const SERVER_VERSION = "0.1.0";
const KEYCHAIN_SERVICE =
  process.env.META_KEYCHAIN_SERVICE?.trim() || "fitliner-meta-ads-access-token";
const GRAPH_API_VERSION =
  process.env.META_GRAPH_API_VERSION?.trim() || "v26.0";
const GRAPH_API_ORIGIN = "https://graph.facebook.com";

const server = new McpServer(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    instructions:
      "Read-only access to the Fitliner Meta Ads account. Use it for reporting, diagnostics, and experiment analysis. It cannot create, edit, publish, pause, resume, or delete ads, and it cannot change budgets.",
  },
);

function getAccessToken() {
  const environmentToken = process.env.META_ACCESS_TOKEN?.trim();
  if (environmentToken) return environmentToken;

  if (process.platform === "darwin") {
    try {
      return execFileSync(
        "/usr/bin/security",
        ["find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        },
      ).trim();
    } catch {
      // A user-facing error is raised below without exposing Keychain output.
    }
  }

  throw new Error(
    `Meta access token is missing. Store it in macOS Keychain under service "${KEYCHAIN_SERVICE}" or provide META_ACCESS_TOKEN to the MCP process. Never commit the token to the repository.`,
  );
}

function getAdAccountId() {
  const configuredId = process.env.META_AD_ACCOUNT_ID?.trim();
  if (!configuredId) {
    throw new Error(
      "META_AD_ACCOUNT_ID is missing. Set it to the numeric Meta ad account ID (the value shown after act= in Ads Manager).",
    );
  }

  const normalizedId = configuredId.replace(/^act_/, "");
  if (!/^\d+$/.test(normalizedId)) {
    throw new Error("META_AD_ACCOUNT_ID must contain digits only.");
  }

  return `act_${normalizedId}`;
}

function parseMetaError(payload, status) {
  const metaError = payload?.error;
  const message = metaError?.message || `Meta API request failed with HTTP ${status}.`;
  const code = metaError?.code ? ` code=${metaError.code}` : "";
  const subcode = metaError?.error_subcode
    ? ` subcode=${metaError.error_subcode}`
    : "";
  return new Error(`Meta API error:${code}${subcode} ${message}`);
}

async function metaGet(path, params = {}) {
  const token = getAccessToken();
  const url = new URL(
    `${GRAPH_API_ORIGIN}/${GRAPH_API_VERSION}/${path.replace(/^\//, "")}`,
  );

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Meta API returned a non-JSON response (HTTP ${response.status}).`);
  }

  if (!response.ok || payload?.error) {
    throw parseMetaError(payload, response.status);
  }

  return payload;
}

async function metaEdge(path, params = {}, maxPages = 10) {
  const rows = [];
  let after;

  for (let page = 0; page < maxPages; page += 1) {
    const payload = await metaGet(path, {
      ...params,
      after,
    });
    rows.push(...(Array.isArray(payload.data) ? payload.data : []));
    after = payload?.paging?.cursors?.after;
    if (!after || !payload?.paging?.next) break;
  }

  return rows;
}

function textResult(data) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorResult(error) {
  const message = error instanceof Error ? error.message : "Unknown Meta API error.";
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

function readOnlyTool(description, inputSchema, handler) {
  return {
    description,
    inputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    handler,
  };
}

function registerReadOnlyTool(name, config) {
  const { handler, ...toolConfig } = config;
  server.registerTool(name, toolConfig, async (input) => {
    try {
      return textResult(await handler(input));
    } catch (error) {
      return errorResult(error);
    }
  });
}

function validateDateRange(since, until) {
  const start = new Date(`${since}T00:00:00Z`);
  const end = new Date(`${until}T00:00:00Z`);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    throw new Error("since and until must be valid dates in YYYY-MM-DD format.");
  }
  if (start > end) throw new Error("since must be on or before until.");

  const days = Math.floor((end - start) / 86_400_000) + 1;
  if (days > 92) {
    throw new Error("One insights request can cover at most 92 days.");
  }
}

registerReadOnlyTool(
  "meta_connection_status",
  readOnlyTool(
    "Verify the configured Meta Ads connection and return non-secret account metadata.",
    {},
    async () => {
      const accountId = getAdAccountId();
      const account = await metaGet(accountId, {
        fields:
          "id,name,account_status,currency,timezone_name,business_name,amount_spent,balance,spend_cap",
      });
      return {
        connected: true,
        graph_api_version: GRAPH_API_VERSION,
        account,
        mode: "read-only",
      };
    },
  ),
);

registerReadOnlyTool(
  "meta_list_campaigns",
  readOnlyTool(
    "List campaigns and their delivery, objective, schedule, and configured budgets.",
    {
      effective_status: z
        .array(
          z.enum([
            "ACTIVE",
            "PAUSED",
            "DELETED",
            "ARCHIVED",
            "IN_PROCESS",
            "WITH_ISSUES",
          ]),
        )
        .optional()
        .describe("Optional campaign delivery-status filter."),
    },
    async ({ effective_status }) => {
      const params = {
        fields:
          "id,name,status,effective_status,objective,buying_type,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time",
        limit: 100,
      };
      if (effective_status?.length) {
        params.effective_status = JSON.stringify(effective_status);
      }
      return metaEdge(`${getAdAccountId()}/campaigns`, params);
    },
  ),
);

registerReadOnlyTool(
  "meta_list_adsets",
  readOnlyTool(
    "List ad sets with delivery status, optimization, targeting, attribution, schedule, and budgets.",
    {
      campaign_id: z
        .string()
        .regex(/^\d+$/)
        .optional()
        .describe("Optional campaign ID filter."),
    },
    async ({ campaign_id }) => {
      const params = {
        fields:
          "id,name,campaign_id,status,effective_status,optimization_goal,billing_event,bid_strategy,bid_amount,daily_budget,lifetime_budget,budget_remaining,start_time,end_time,targeting,attribution_spec,promoted_object,created_time,updated_time",
        limit: 100,
      };
      if (campaign_id) {
        params.filtering = JSON.stringify([
          { field: "campaign.id", operator: "EQUAL", value: campaign_id },
        ]);
      }
      return metaEdge(`${getAdAccountId()}/adsets`, params);
    },
  ),
);

registerReadOnlyTool(
  "meta_list_ads",
  readOnlyTool(
    "List ads and creative metadata without modifying delivery.",
    {
      adset_id: z
        .string()
        .regex(/^\d+$/)
        .optional()
        .describe("Optional ad set ID filter."),
    },
    async ({ adset_id }) => {
      const params = {
        fields:
          "id,name,campaign_id,adset_id,status,effective_status,creative{id,name,title,body,object_story_id,thumbnail_url},created_time,updated_time",
        limit: 100,
      };
      if (adset_id) {
        params.filtering = JSON.stringify([
          { field: "adset.id", operator: "EQUAL", value: adset_id },
        ]);
      }
      return metaEdge(`${getAdAccountId()}/ads`, params);
    },
  ),
);

const insightBreakdown = z.enum([
  "age",
  "gender",
  "country",
  "region",
  "device_platform",
  "publisher_platform",
  "platform_position",
  "impression_device",
]);

registerReadOnlyTool(
  "meta_get_insights",
  readOnlyTool(
    "Get Meta Ads performance metrics, conversion actions, and costs for a date range of up to 92 days.",
    {
      since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      level: z.enum(["account", "campaign", "adset", "ad"]).default("campaign"),
      time_increment: z
        .union([z.literal(1), z.literal(7), z.literal(28)])
        .optional()
        .describe("Optional daily, weekly, or 28-day rows."),
      breakdowns: z
        .array(insightBreakdown)
        .max(2)
        .optional()
        .describe("Optional Meta-supported breakdowns; some pairs are incompatible."),
    },
    async ({ since, until, level, time_increment, breakdowns }) => {
      validateDateRange(since, until);
      return metaEdge(`${getAdAccountId()}/insights`, {
        fields:
          "account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,frequency,spend,cpm,clicks,inline_link_clicks,ctr,cpc,actions,cost_per_action_type,action_values,website_purchase_roas",
        time_range: JSON.stringify({ since, until }),
        level,
        time_increment,
        breakdowns: breakdowns?.join(","),
        action_report_time: "conversion",
        use_account_attribution_setting: "true",
        limit: 100,
      });
    },
  ),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`${SERVER_NAME} ${SERVER_VERSION} running on stdio (${GRAPH_API_VERSION}, read-only)`);
