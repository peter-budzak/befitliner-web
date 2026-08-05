# Fitliner Meta Ads MCP

Read-only MCP server for Meta Marketing API reporting and analysis.

## Security model

- All exposed MCP tools are read-only.
- The Meta token is read from `META_ACCESS_TOKEN` or macOS Keychain.
- No token is written to this repository or included in API URLs.
- Insights requests are limited to 92 days and two breakdown dimensions.
- There are no tools for budgets, campaign changes, publishing, or deletion.

## macOS Keychain

Store the Meta access token as a generic password with service name:

`fitliner-meta-ads-access-token`

The account name can be any descriptive value, such as `fitliner`.

## Codex configuration

Copy `.codex/meta-ads.example.toml` to `.codex/config.toml`, replace the ad
account ID, restart Codex, and use `/mcp` to verify the server.

The configured Graph API version can be changed through
`META_GRAPH_API_VERSION` when the Meta app dashboard uses a different version.
