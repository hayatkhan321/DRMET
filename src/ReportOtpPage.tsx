import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReportOtpPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [otpCode, setOtpCode] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleVerifyOtp = () => {
    setErrorText("");

    if (!otpCode.trim()) {
      setErrorText("Please enter the verification code.");
      return;
    }

    // placeholder verification
    navigate(`/r/${encodeURIComponent(token)}/report`);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={stepLabelStyle}>Extra Verification</div>

        <h1 style={titleStyle}>Extra Verification Needed</h1>
        <p style={subtitleStyle}>
          For your security, we need one more verification step.
        </p>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Verification Code</label>
          <input
            style={inputStyle}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Enter OTP code"
          />
        </div>

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        <div style={buttonStackStyle}>
          <button style={primaryButtonStyle} onClick={handleVerifyOtp}>
            Verify Code
          </button>

          <button style={secondaryButtonStyle}>
            Resend Code
          </button>
        </div>

        <div style={helpStyle}>This should take less than 1 minute.</div>
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
};

const stepLabelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#2563eb",
  marginBottom: "12px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "30px",
  fontWeight: 800,
  color: "#0f172a",
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#475569",
  marginTop: "10px",
  marginBottom: "24px",
  lineHeight: 1.5,
};

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: "16px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  color: "#334155",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
};

const buttonStackStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "20px",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
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
  width: "100%",
  background: "white",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  padding: "16px 18px",
  fontSize: "16px",
  fontWeight: 800,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#b91c1c",
  fontSize: "14px",
  fontWeight: 600,
};

const helpStyle: React.CSSProperties = {
  marginTop: "14px",
  color: "#64748b",
  fontSize: "13px",
  textAlign: "center",
};