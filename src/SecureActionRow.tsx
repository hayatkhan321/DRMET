import type { CSSProperties, ReactNode } from "react";

export default function SecureActionRow({
  primaryLabel,
  secondaryLabel,
  tertiaryLabel,
  onPrimaryClick,
  onSecondaryClick,
  onTertiaryClick,
  rightSlot,
}: {
  primaryLabel?: string;
  secondaryLabel?: string;
  tertiaryLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  onTertiaryClick?: () => void;
  rightSlot?: ReactNode;
}) {
  return (
    <div style={rowStyle}>
      <div style={leftButtonsStyle}>
        {primaryLabel ? (
          <button style={primaryButtonStyle} onClick={onPrimaryClick}>
            {primaryLabel}
          </button>
        ) : null}

        {secondaryLabel ? (
          <button style={secondaryButtonStyle} onClick={onSecondaryClick}>
            {secondaryLabel}
          </button>
        ) : null}

        {tertiaryLabel ? (
          <button style={secondaryButtonStyle} onClick={onTertiaryClick}>
            {tertiaryLabel}
          </button>
        ) : null}
      </div>

      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const leftButtonsStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const primaryButtonStyle: CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  background: "white",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};