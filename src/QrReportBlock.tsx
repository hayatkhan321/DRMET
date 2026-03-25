import { QRCodeSVG } from "qrcode.react";

export default function QrReportBlock({
  encounterId,
  title = "Secure Detailed Report",
}: {
  encounterId: string;
  title?: string;
}) {
  const secureUrl = `${window.location.origin}/r/${encodeURIComponent(encounterId)}`;

  return (
    <div style={cardStyle}>
      <div style={leftStyle}>
        <QRCodeSVG
          value={secureUrl}
          size={108}
          bgColor="#ffffff"
          fgColor="#0f172a"
          includeMargin={true}
        />
      </div>

      <div style={rightStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={textStyle}>
          Scan to open the secure detailed report with progression, follow-up guidance,
          and future linked external records.
        </div>
        <div style={textStyle}>
          Access is intended for secure server-side validation before detailed report view.
        </div>
        <div style={urlStyle}>{secureUrl}</div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  alignItems: "flex-start",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
};

const leftStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "8px",
  flexShrink: 0,
};

const rightStyle: React.CSSProperties = {
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: "8px",
};

const textStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: 1.5,
  marginBottom: "8px",
};

const urlStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  wordBreak: "break-all",
};