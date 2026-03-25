import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReportVerifyPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorText, setErrorText] = useState("");

  const handleVerify = () => {
    setErrorText("");

    if (!firstName.trim() || !dateOfBirth.trim() || !phoneNumber.trim()) {
      setErrorText("Please complete all fields.");
      return;
    }

    // placeholder logic
    // later this will call backend verification endpoint
    const shouldRequireOtp = false;

    if (shouldRequireOtp) {
      navigate(`/r/${encodeURIComponent(token)}/otp`);
      return;
    }

    navigate(`/r/${encodeURIComponent(token)}/report`);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={stepLabelStyle}>Secure Verification</div>

        <h1 style={titleStyle}>Verify Your Identity</h1>
        <p style={subtitleStyle}>
          To protect your health information, please confirm a few details before opening your report.
        </p>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>First Name</label>
          <input
            style={inputStyle}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Date of Birth</label>
          <input
            type="date"
            style={inputStyle}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Phone Number</label>
          <input
            style={inputStyle}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+971..."
          />
        </div>

        {errorText ? <div style={errorStyle}>{errorText}</div> : null}

        <div style={buttonRowStyle}>
          <button style={primaryButtonStyle} onClick={handleVerify}>
            Open My Report
          </button>
        </div>
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
  maxWidth: "540px",
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

const buttonRowStyle: React.CSSProperties = {
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

const errorStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#b91c1c",
  fontSize: "14px",
  fontWeight: 600,
};