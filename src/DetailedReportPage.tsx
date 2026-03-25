import { Link, useParams } from "react-router-dom";

export default function DetailedReportPage() {
  const { token = "" } = useParams();

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <div style={headerCardStyle}>
          <div>
            <div style={smallLabelStyle}>Secure Detailed Report</div>
            <h1 style={titleStyle}>Detailed Eye Report</h1>
            <div style={subtleTextStyle}>Token: {token}</div>
          </div>

          <div style={actionRowStyle}>
            <button style={primaryButtonStyle}>Download PDF</button>
            <button style={secondaryButtonStyle}>Open in App</button>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Standard Summary</h2>
          <div style={summaryGridStyle}>
            <div style={summaryItemStyle}><strong>Final Color:</strong> Orange</div>
            <div style={summaryItemStyle}><strong>Risk Band:</strong> High</div>
            <div style={summaryItemStyle}><strong>Urgency:</strong> Retina-directed review</div>
            <div style={summaryItemStyle}><strong>Follow-up:</strong> 1–3 months</div>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Patient Risk Position</h2>
          <div style={placeholderBoxStyle}>Risk strip placeholder</div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Domain Gauges</h2>
          <div style={gaugeGridStyle}>
            <div style={placeholderCardStyle}>Retinopathy Gauge</div>
            <div style={placeholderCardStyle}>Macular / DME Gauge</div>
            <div style={placeholderCardStyle}>Systemic Gauge</div>
            <div style={placeholderCardStyle}>Safety / Reliability Gauge</div>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Top Drivers</h2>
          <ul style={listStyle}>
            <li>Driver 1 placeholder</li>
            <li>Driver 2 placeholder</li>
            <li>Driver 3 placeholder</li>
          </ul>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Progression Across Visits</h2>
          <div style={placeholderBoxStyle}>Timeline / progression placeholder</div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>External Reports Reviewed</h2>
          <div style={placeholderBoxStyle}>External reports placeholder</div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Patient Education</h2>
          <div style={educationBoxStyle}>
            <p>Educational explanation placeholder.</p>
            <p>Warning signs placeholder.</p>
            <p>Downloadable resource links placeholder.</p>
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <Link to={`/r/${encodeURIComponent(token)}`} style={backLinkStyle}>
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "24px",
};

const contentStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerCardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "20px",
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  alignItems: "center",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const smallLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 800,
  color: "#2563eb",
  marginBottom: "8px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 800,
  color: "#0f172a",
};

const subtleTextStyle: React.CSSProperties = {
  marginTop: "8px",
  fontSize: "14px",
  color: "#64748b",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "white",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 800,
  cursor: "pointer",
};

const panelStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "16px",
  fontSize: "24px",
  fontWeight: 800,
  color: "#0f172a",
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

const summaryItemStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
};

const placeholderBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px dashed #94a3b8",
  borderRadius: "16px",
  padding: "28px",
  color: "#64748b",
  textAlign: "center",
};

const gaugeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
};

const placeholderCardStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px dashed #94a3b8",
  borderRadius: "16px",
  padding: "28px",
  color: "#64748b",
  textAlign: "center",
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "20px",
  color: "#334155",
};

const educationBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
  color: "#334155",
};

const backLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#2563eb",
  fontWeight: 800,
};