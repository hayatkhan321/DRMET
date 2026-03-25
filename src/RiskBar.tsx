import type { CSSProperties } from "react";

function getRiskPosition(color?: string) {
  switch (color) {
    case "Green":
      return "12%";
    case "Yellow":
      return "38%";
    case "Orange":
      return "68%";
    case "Red":
      return "92%";
    default:
      return "0%";
  }
}

export default function RiskBar({
  color,
  title,
  subtitle,
}: {
  color?: string;
  title?: string;
  subtitle?: string;
}) {
  const position = getRiskPosition(color);

  return (
    <div style={containerStyle}>
      {title ? <h3 style={titleStyle}>{title}</h3> : null}
      {subtitle ? <div style={subtitleStyle}>{subtitle}</div> : null}

      <div style={barWrapStyle}>
        <div
          style={{
            ...markerStyle,
            left: position,
          }}
        >
          ▼
        </div>

        <div style={barStyle}>
          <div style={barGridStyle}>
            <div style={{ background: "#22c55e" }} />
            <div style={{ background: "#eab308" }} />
            <div style={{ background: "#f97316" }} />
            <div style={{ background: "#ef4444" }} />
          </div>
        </div>
      </div>

      <div style={legendGridStyle}>
        <div>Green</div>
        <div>Yellow</div>
        <div>Orange</div>
        <div>Red</div>
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  marginTop: "14px",
  marginBottom: "10px",
};

const titleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: "8px",
  fontSize: "22px",
  fontWeight: 800,
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  color: "#475569",
  fontSize: "15px",
  marginBottom: "4px",
};

const barWrapStyle: CSSProperties = {
  position: "relative",
  paddingTop: "14px",
};

const markerStyle: CSSProperties = {
  position: "absolute",
  top: "2px",
  transform: "translateX(-50%)",
  fontSize: "34px",
  fontWeight: 900,
  lineHeight: 1,
  color: "#000000",
  textShadow: "0 1px 0 rgba(255,255,255,0.35)",
  zIndex: 2,
  pointerEvents: "none",
};

const barStyle: CSSProperties = {
  height: "18px",
  borderRadius: "999px",
  overflow: "hidden",
  border: "1px solid #cbd5e1",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
};

const barGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr",
  height: "100%",
};

const legendGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr",
  marginTop: "8px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
  textAlign: "center",
};