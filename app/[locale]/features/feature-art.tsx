import type { ReactNode } from "react";
const icons: Record<string, ReactNode> = {
  training: (
    <>
      <path d="M7 8v8M4 10v4m13-6v8m3-6v4M7 12h10" />
    </>
  ),
  nutrition: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v8l7 4M12 12l-7 4" />
    </>
  ),
  coach: (
    <>
      <path d="M20 11a8 8 0 0 1-8 8H4l1-4a8 8 0 1 1 15-4Z" />
      <path d="m12 7 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" />
    </>
  ),
  gyms: (
    <>
      <path d="M5 21V3h14v18M9 21V7h6v14M12 13h.01" />
    </>
  ),
  progress: (
    <>
      <path d="M4 4v16h16M7 15l4-4 4 2 5-7" />
    </>
  ),
  health: (
    <>
      <path d="M7 3h10v18H7zM9 8h6m-3-3v6M9 15h6m-6 3h4" />
    </>
  ),
  today: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="3" />
      <path d="M8 3v4m8-4v4M4 11h16m-12 4h3m3 0h2m-8 3h3" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  community: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2m0-15a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 4v2" />
    </>
  ),
  diamonds: <path d="m3 9 4-5h10l4 5-9 12Zm0 0h18M9 4 7 9l5 12 5-12-2-5" />,
  trainers: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21v-4a6 6 0 0 1 12 0v4m-9-9 3 4 3-4" />
    </>
  ),
  owners: (
    <>
      <path d="M3 21h18M5 21V7h14v14M8 7V3h8v4M9 11h1m4 0h1m-6 4h1m4 0h1m-4 6v-3h2v3" />
    </>
  ),
};
export function FeatureIcon({ id }: { id: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[id]}
    </svg>
  );
}
export function FeatureArt({ id }: { id: string }) {
  let art: ReactNode;
  if (id === "training")
    art = (
      <>
        <rect
          x="42"
          y="24"
          width="202"
          height="142"
          rx="18"
          fill="#1f1830"
          stroke="#8567b555"
        />
        {[0, 1, 2].map((n) => (
          <g
            key={n}
            className="art-step"
            style={{ animationDelay: `${n * 120}ms` }}
          >
            <circle cx="72" cy={58 + n * 38} r="10" fill="#a878f522" />
            <path
              d={`m67 ${58 + n * 38} 3 3 6-7`}
              fill="none"
              stroke="#c9a4ff"
              strokeWidth="2"
            />
            <rect
              x="94"
              y={52 + n * 38}
              width={103 - n * 15}
              height="5"
              rx="3"
              fill="#b8a6ce"
            />
            <rect
              x="94"
              y={63 + n * 38}
              width="62"
              height="4"
              rx="2"
              fill="#62526f"
            />
          </g>
        ))}
        <g stroke="#d7b9ff" strokeWidth="7" strokeLinecap="round">
          <path d="M261 84h55m-47-15v31m-9-25v19m49-25v31m9-25v19" />
        </g>
        <path
          className="art-draw"
          pathLength="1"
          d="m253 137 17-12 15 5 28-25"
          stroke="#8be0c2"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  else if (id === "nutrition")
    art = (
      <>
        <circle cx="117" cy="94" r="68" fill="#1b1928" stroke="#77608a55" />
        <circle
          cx="117"
          cy="94"
          r="47"
          fill="none"
          stroke="#a777ee"
          strokeWidth="18"
          strokeDasharray="126 295"
          transform="rotate(-90 117 94)"
        />
        <circle
          cx="117"
          cy="94"
          r="47"
          fill="none"
          stroke="#81ceb4"
          strokeWidth="18"
          strokeDasharray="80 295"
          strokeDashoffset="-132"
          transform="rotate(-90 117 94)"
        />
        <circle
          cx="117"
          cy="94"
          r="47"
          fill="none"
          stroke="#deb681"
          strokeWidth="18"
          strokeDasharray="68 295"
          strokeDashoffset="-218"
          transform="rotate(-90 117 94)"
        />
        {["#a777ee", "#81ceb4", "#deb681"].map((color, n) => (
          <g
            key={color}
            className="art-step"
            style={{ animationDelay: `${n * 120}ms` }}
          >
            <circle cx="222" cy={58 + n * 36} r="4" fill={color} />
            <rect
              x="237"
              y={54 + n * 36}
              width="75"
              height="5"
              rx="3"
              fill="#54465f"
            />
            <rect
              x="237"
              y={54 + n * 36}
              width={67 - n * 16}
              height="5"
              rx="3"
              fill={color}
            />
          </g>
        ))}
      </>
    );
  else if (id === "coach")
    art = (
      <>
        <g className="art-step">
          <path
            d="M56 34h163a14 14 0 0 1 14 14v29a14 14 0 0 1-14 14H68L42 105V48a14 14 0 0 1 14-14Z"
            fill="#38274f"
            stroke="#ae85ed55"
          />
          <path
            d="M66 56h138M66 69h88"
            stroke="#b59acc"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <g className="art-step" style={{ animationDelay: "180ms" }}>
          <path
            d="M142 104h160a14 14 0 0 1 14 14v26l10 18-26-5H142a14 14 0 0 1-14-14v-25a14 14 0 0 1 14-14Z"
            fill="#202e2b"
            stroke="#81ceb455"
          />
          <path
            d="M151 126h109M151 139h135"
            stroke="#9bc7b9"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <path d="m290 29 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="#c7a3ff" />
      </>
    );
  else
    art = (
      <>
        <rect
          x="58"
          y="43"
          width="73"
          height="117"
          rx="14"
          fill="#211a2e"
          stroke="#ba91f1"
          strokeWidth="2"
        />
        <path
          d="M82 53h25M88 148h13"
          stroke="#ab92c8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="80" y="92" width="28" height="24" rx="5" fill="#b38bea" />
        <path
          d="M86 92v-8a8 8 0 0 1 16 0"
          fill="none"
          stroke="#b38bea"
          strokeWidth="3"
        />
        <path
          className="art-draw"
          pathLength="1"
          d="M144 103h71"
          stroke="#88d7bd"
          strokeWidth="3"
          strokeDasharray="4 5"
        />
        <path
          d="m207 96 8 7-8 7"
          fill="none"
          stroke="#88d7bd"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M241 160V34h69v126"
          fill="#1b1926"
          stroke="#8669a5"
          strokeWidth="2"
        />
        <path
          d="m252 160 45-13V46l-45-12Z"
          fill="#30203f"
          stroke="#c9a4ff"
          strokeWidth="2"
        />
        <circle cx="285" cy="103" r="3" fill="#ddc5ff" />
      </>
    );
  return (
    <div className={`feature-art feature-art-${id}`} data-feature-art>
      <svg
        viewBox="0 0 360 190"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {art}
      </svg>
    </div>
  );
}
