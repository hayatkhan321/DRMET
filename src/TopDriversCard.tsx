import type { CSSProperties } from "react";

export default function TopDriversCard({
  title = "Top Drivers",
  topDriver1,
  topDriver2,
  topDriver3,
  topOcularDriver,
  topSystemicDriver,
  topSafetyDriver,
}: {
  title?: string;
  topDriver1?: string;
  topDriver2?: string;
  topDriver3?: string;
  topOcularDriver?: string;
  topSystemicDriver?: string;
  topSafetyDriver?: string;
}) {
  const hasAny =
    !!topDriver1 ||
    !!topDriver2 ||
    !!topDriver3 ||
    !!topOcularDriver ||
    !!topSystemicDriver ||
    !!topSafetyDriver;

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>{title}</h3>

      {!hasAny ? (
        <div style={emptyStyle}>No driver explanation available yet.</div>
      ) : (
        <div style={gridStyle}>
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Overall</div>
            <ul style={listStyle}>
              {topDriver1 ? <li>{topDriver1}</li> : null}
              {topDriver2 ? <li>{topDriver2}</li> : null}
              {topDriver3 ? <li>{topDriver3}</li> : null}
            </ul>
          </div>

          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>By Domain</div>
            <ul style={listStyle}>
              {topOcularDriver ? <li><strong>Ocular:</strong> {topOcularDriver}</li> : null}
              {topSystemicDriver ? <li><strong>Systemic:</strong> {topSystemicDriver}</li> : null}
              {topSafetyDriver ? <li><strong>Safety:</strong> {topSafetyDriver}</li> : null}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
};

const titleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: "12px",
  fontSize: "18px",
  fontWeight: 800,
  color: "#0f172a",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const sectionStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#334155",
  marginBottom: "8px",
};

const listStyle: CSSProperties = {
  margin: 0,
  paddingLeft: "18px",
  color: "#334155",
  fontSize: "14px",
  lineHeight: 1.5,
};

const emptyStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
};