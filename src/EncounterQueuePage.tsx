import { Link, useNavigate } from "react-router-dom";
import type { Encounter } from "./sharedtype";
import { deleteEncounter, formatEncounterColor, loadEncounters } from "./sharedstorage";

function getColorBadgeStyle(color?: string): React.CSSProperties {
  switch (color) {
    case "Green":
      return { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" };
    case "Yellow":
      return { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" };
    case "Orange":
      return { background: "#ffedd5", color: "#9a3412", border: "1px solid #fdba74" };
    case "Red":
      return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" };
    default:
      return { background: "#e2e8f0", color: "#334155", border: "1px solid #cbd5e1" };
  }
}

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

function RiskBar({ color }: { color?: string }) {
  const position = getRiskPosition(color);

  return (
    <div style={{ marginTop: "14px", marginBottom: "10px" }}>
      <div
        style={{
          position: "relative",
          paddingTop: "14px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: position,
            top: "2px",
            transform: "translateX(-50%)",
            fontSize: "34px",
            fontWeight: 900,
            lineHeight: 1,
            color: "#000000",
            textShadow: "0 1px 0 rgba(255,255,255,0.35)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          ▼
        </div>

        <div
          style={{
            height: "18px",
            borderRadius: "999px",
            overflow: "hidden",
            border: "1px solid #cbd5e1",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              height: "100%",
            }}
          >
            <div style={{ background: "#22c55e" }} />
            <div style={{ background: "#eab308" }} />
            <div style={{ background: "#f97316" }} />
            <div style={{ background: "#ef4444" }} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          marginTop: "8px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#334155",
          textAlign: "center",
        }}
      >
        <div>Green</div>
        <div>Yellow</div>
        <div>Orange</div>
        <div>Red</div>
      </div>
    </div>
  );
}

function formatDateTime(value?: string) {
  if (!value) return "--";
  return value;
}

function formatShort(value?: string) {
  return value && value.trim() ? value : "--";
}

export default function EncounterQueuePage() {
  const navigate = useNavigate();
  const encounters = loadEncounters().slice().reverse();

  const handleOpen = (encounterId: string) => {
    navigate(`/encounters/workspace/${encodeURIComponent(encounterId)}`);
  };

  const handleDelete = (encounterId: string) => {
    const ok = window.confirm("Delete this encounter?");
    if (!ok) return;

    deleteEncounter(encounterId);
    window.location.reload();
  };

  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>Encounter Queue</h1>
      <p style={{ fontSize: "18px", color: "#475569", marginBottom: "24px" }}>
        Review all saved and completed encounters.
      </p>

      <div style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Total Encounters</div>
          <div style={summaryValueStyle}>{encounters.length}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Draft</div>
          <div style={summaryValueStyle}>
            {encounters.filter((e) => e.status === "Draft").length}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Saved</div>
          <div style={summaryValueStyle}>
            {encounters.filter((e) => e.status === "Saved").length}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Completed</div>
          <div style={summaryValueStyle}>
            {encounters.filter((e) => e.status === "Completed").length}
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        {encounters.length === 0 ? (
          <p style={{ color: "#64748b" }}>No saved encounters found.</p>
        ) : (
          encounters.map((encounter) => {
            const displayColor = formatEncounterColor(encounter);

            return (
              <div key={encounter.encounterId} style={rowStyle}>
                <div style={topRowStyle}>
                  <div style={{ flex: 1.8, minWidth: "240px" }}>
                    <div style={nameStyle}>
                      {encounter.firstName} {encounter.lastName}
                    </div>
                    <div style={mutedStyle}>
                      {encounter.patientId} • {encounter.displayId}
                    </div>
                    <div style={mutedStyle}>MRN: {encounter.mrn || "--"}</div>
                  </div>

                  <div style={{ flex: 1.3, minWidth: "220px" }}>
                    <div><strong>Encounter:</strong> {formatShort(encounter.encounterType)}</div>
                    <div style={mutedStyle}>{formatDateTime(encounter.encounterDateTime)}</div>
                    <div style={mutedStyle}>Saved: {encounter.lastSavedAt || "--"}</div>
                  </div>

                  <div style={{ flex: 1, minWidth: "160px" }}>
                    <div><strong>Status:</strong> {encounter.status || "--"}</div>
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ ...badgeStyle, ...getColorBadgeStyle(displayColor) }}>
                        {displayColor}
                      </span>
                    </div>
                  </div>

                  <div style={actionsStyle}>
                    <button
                      style={buttonPrimaryStyle}
                      onClick={() => handleOpen(encounter.encounterId)}
                    >
                      Open
                    </button>

                    <Link
                      to={`/encounters/${encodeURIComponent(encounter.encounterId)}/reports`}
                      style={linkButtonStyle}
                    >
                      Reports
                    </Link>

                    <button
                      style={buttonDangerStyle}
                      onClick={() => handleDelete(encounter.encounterId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <RiskBar color={displayColor} />

                <div style={metricsGridStyle}>
                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>Total</div>
                    <div style={metricValueStyle}>{encounter.totalScore ?? "--"}</div>
                  </div>

                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>Ocular</div>
                    <div style={metricValueStyle}>{encounter.ocularScore ?? "--"}</div>
                  </div>

                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>Systemic</div>
                    <div style={metricValueStyle}>{encounter.systemicScore ?? "--"}</div>
                  </div>

                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>Reliability</div>
                    <div style={metricValueStyle}>{encounter.reliabilityScore ?? "--"}</div>
                  </div>

                  <div style={metricBoxStyle}>
                    <div style={metricLabelStyle}>Confidence</div>
                    <div style={metricValueStyleSmall}>
                      {encounter.confidenceGrade || "--"}
                    </div>
                  </div>
                </div>

                <div style={detailGridStyle}>
                  <div>
                    <div><strong>Urgency:</strong> {encounter.urgency || "--"}</div>
                    <div style={mutedStyle}>
                      Follow-up: {encounter.followUp || "--"}
                    </div>
                  </div>

                  <div>
                    <div><strong>Action:</strong> {encounter.suggestedAction || "--"}</div>
                    {encounter.overrideApplied && (
                      <div style={{ ...mutedStyle, color: "#b91c1c" }}>
                        Override: {encounter.overrideReason || "Applied"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: "24px" }}>
        <Link to="/patients" style={linkButtonStyle}>
          Go to Patients
        </Link>
      </div>
    </div>
  );
}

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const summaryCardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const summaryLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
  marginBottom: "8px",
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#0f172a",
};

const panelStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const rowStyle: React.CSSProperties = {
  padding: "20px 0",
  borderBottom: "1px solid #e2e8f0",
};

const topRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const nameStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "20px",
  color: "#0f172a",
};

const mutedStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
  marginTop: "4px",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  marginLeft: "auto",
  flexWrap: "wrap",
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "12px",
  marginTop: "18px",
};

const metricBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
};

const metricLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  marginBottom: "6px",
};

const metricValueStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "24px",
  color: "#0f172a",
};

const metricValueStyleSmall: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "16px",
  color: "#0f172a",
};

const detailGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.3fr",
  gap: "16px",
  marginTop: "18px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
};

const buttonPrimaryStyle: React.CSSProperties = {
  background: "#0f172a",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonDangerStyle: React.CSSProperties = {
  background: "#991b1b",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const linkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  background: "white",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
};