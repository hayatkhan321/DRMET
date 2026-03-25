import { useNavigate, useParams } from "react-router-dom";

export default function ReportQrLandingPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const handleOpenInApp = () => {
    // future deep-link logic
    // for now, redirect to website verification fallback
    navigate(`/r/${encodeURIComponent(token)}/verify`);
  };

  const handleOpenOnWebsite = () => {
    navigate(`/r/${encodeURIComponent(token)}/verify`);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>DRMET Secure Report</div>

        <h1 style={titleStyle}>Open Your Secure Eye Report</h1>
        <p style={subtitleStyle}>This usually takes less than 1 minute.</p>

        <div style={buttonStackStyle}>
          <button style={primaryButtonStyle} onClick={handleOpenInApp}>
            Open in App
          </button>

          <button style={secondaryButtonStyle} onClick={handleOpenOnWebsite}>
            Open Secure Report on Website
          </button>
        </div>

        <div style={privacyBoxStyle}>
          Your report is protected and can only be opened after identity verification.
        </div>

        <div style={helpStyle}>Need help? Please contact your clinic.</div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
  padding: "24px",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  textAlign: "center",
};

const logoStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#2563eb",
  letterSpacing: "0.4px",
  marginBottom: "14px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 800,
  color: "#0f172a",
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#475569",
  marginTop: "10px",
  marginBottom: "28px",
};

const buttonStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "14px",
  padding: "16px 18px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "white",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  padding: "16px 18px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
};

const privacyBoxStyle: React.CSSProperties = {
  marginTop: "20px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
  fontSize: "14px",
  color: "#475569",
};

const helpStyle: React.CSSProperties = {
  marginTop: "18px",
  fontSize: "13px",
  color: "#64748b",
};