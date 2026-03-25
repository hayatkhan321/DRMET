import type { CSSProperties } from "react";

export default function GaugeCard({
  title,
  score,
  max,
  driver,
}: {
  title: string;
  score?: number | null;
  max: number;
  driver?: string;
}) {
  const safeScore = typeof score === "number" ? Math.max(0, Math.min(score, max)) : 0;

  const percent = max > 0 ? Math.round((safeScore / max) * 100) : 0;

  // FIX:
  // The visible arc is the UPPER semicircle.
  // In SVG coordinates, that means the needle must sweep from 180° (left)
  // through 270° (top) to 360° (right).
  const angle = 180 + (percent / 100) * 180;

  const cx = 100;
  const cy = 100;
  const r = 64;

  const needleX = cx + r * Math.cos((angle * Math.PI) / 180);
  const needleY = cy + r * Math.sin((angle * Math.PI) / 180);

  const zoneLabel =
    percent <= 25 ? "Low" :
    percent <= 50 ? "Moderate" :
    percent <= 75 ? "High" :
    "Very High";

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{title}</div>

      <svg viewBox="0 0 200 130" style={svgStyle}>
        <path d="M 36 100 A 64 64 0 0 1 68 44" stroke="#22c55e" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M 68 44 A 64 64 0 0 1 100 36" stroke="#eab308" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M 100 36 A 64 64 0 0 1 132 44" stroke="#f97316" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M 132 44 A 64 64 0 0 1 164 100" stroke="#ef4444" strokeWidth="14" fill="none" strokeLinecap="round" />

        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#111827"
          strokeWidth="4.8"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="7" fill="#111827" />
      </svg>

      <div style={scoreStyle}>
        {score ?? "--"} <span style={maxStyle}>/ {max}</span>
      </div>

      <div style={percentStyle}>{percent}% • {zoneLabel}</div>

      <div style={driverStyle}>{driver || "No dominant driver available"}</div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  borderRadius: "18px",
  padding: "16px",
  textAlign: "center",
  color: "#0f172a",
};

const titleStyle: CSSProperties = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: "6px",
  minHeight: "40px",
};

const svgStyle: CSSProperties = {
  width: "100%",
  height: "150px",
  overflow: "visible",
};

const scoreStyle: CSSProperties = {
  fontSize: "26px",
  fontWeight: 800,
  color: "#0f172a",
  marginTop: "-4px",
};

const maxStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#64748b",
};

const percentStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
  marginTop: "4px",
};

const driverStyle: CSSProperties = {
  fontSize: "13px",
  color: "#475569",
  marginTop: "6px",
  minHeight: "36px",
  lineHeight: 1.35,
};