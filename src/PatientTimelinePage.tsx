import { Link, useNavigate, useParams } from "react-router-dom";
import type { Encounter, Patient } from "./sharedtype";
import { getPatientById, loadEncounters, formatEncounterColor } from "./sharedstorage";

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

function colorRank(color?: string) {
  switch (color) {
    case "Green":
      return 1;
    case "Yellow":
      return 2;
    case "Orange":
      return 3;
    case "Red":
      return 4;
    default:
      return 0;
  }
}

function normalizeDate(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getProgressionLabel(current: Encounter, previous?: Encounter | null) {
  if (!previous) return "First recorded encounter";

  const currentColor = current.finalColor || current.riskBand;
  const previousColor = previous.finalColor || previous.riskBand;

  const currentRank = colorRank(currentColor);
  const previousRank = colorRank(previousColor);

  if (currentRank > previousRank) return "Worsened";
  if (currentRank < previousRank) return "Improved";

  const currentTotal = current.totalScore ?? 0;
  const previousTotal = previous.totalScore ?? 0;

  if (currentTotal > previousTotal) return "Slight worsening";
  if (currentTotal < previousTotal) return "Slight improvement";

  return "Stable";
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

export default function PatientTimelinePage() {
  const { patientId = "" } = useParams();
  const navigate = useNavigate();

  const patient: Patient | null = getPatientById(patientId);

  const encounters = loadEncounters()
    .filter((e) => e.patientId === patientId)
    .slice()
    .sort((a, b) => normalizeDate(a.encounterDateTime) - normalizeDate(b.encounterDateTime));

  const latest = encounters.length ? encounters[encounters.length - 1] : null;

  const handleOpen = (encounterId: string) => {
    navigate(`/encounters/workspace/${encodeURIComponent(encounterId)}`);
  };

  if (!patient) {
    return (
      <div>
        <h1>Patient not found</h1>
        <p>Please return to Patients and select a saved patient.</p>
        <div style={{ marginTop: "20px" }}>
          <Link to="/patients" style={linkButtonStyle}>
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>Patient Timeline</h1>
      <p style={{ fontSize: "18px", color: "#475569", marginBottom: "24px" }}>
        Longitudinal view of encounters and DRMET progression.
      </p>

      <div style={headerPanelStyle}>
        <div>
          <div style={sectionLabelStyle}>Patient</div>
          <div style={headerValueStyle}>
            {patient.firstName} {patient.lastName}
          </div>
          <div style={mutedStyle}>MRN: {patient.mrn}</div>
        </div>

        <div>
          <div style={sectionLabelStyle}>Identifiers</div>
          <div style={mutedStyle}>Patient ID: {patient.patientId}</div>
          <div style={mutedStyle}>Display ID: {patient.displayId}</div>
        </div>

        <div>
          <div style={sectionLabelStyle}>Profile</div>
          <div style={mutedStyle}>Diabetes Type: {patient.diabetesType || "--"}</div>
          <div style={mutedStyle}>
            Origin: {patient.originCityName}, {patient.originCountryName}
          </div>
        </div>

        <div>
          <div style={sectionLabelStyle}>Latest DRMET Status</div>
          <div style={{ marginTop: "6px" }}>
            <span
              style={{
                ...badgeStyle,
                ...getColorBadgeStyle(latest?.finalColor || latest?.riskBand),
              }}
            >
              {latest?.finalColor || latest?.riskBand || "--"}
            </span>
          </div>
          <div style={mutedStyle}>Latest score: {latest?.totalScore ?? "--"}</div>
        </div>
      </div>

      {latest && (
        <div style={panelStyle}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "8px",
              fontSize: "26px",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "0.2px",
            }}
          >
            Patient Risk Position
          </h2>

          <div
            style={{
              color: "#475569",
              fontSize: "15px",
              marginBottom: "4px",
            }}
          >
            This strip shows where the patient currently sits between lower-risk Green and higher-risk Red.
          </div>

          <RiskBar color={latest.finalColor || latest.riskBand} />
        </div>
      )}

      <div style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Encounters</div>
          <div style={summaryValueStyle}>{encounters.length}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Latest Ocular</div>
          <div style={summaryValueStyle}>{latest?.ocularScore ?? "--"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Latest Systemic</div>
          <div style={summaryValueStyle}>{latest?.systemicScore ?? "--"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Latest Reliability</div>
          <div style={summaryValueStyle}>{latest?.reliabilityScore ?? "--"}</div>
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Encounter History</h2>

        {encounters.length === 0 ? (
          <p style={{ color: "#64748b" }}>No encounters found for this patient yet.</p>
        ) : (
          encounters.map((encounter, index) => {
            const previous = index > 0 ? encounters[index - 1] : null;
            const displayColor = encounter.finalColor || encounter.riskBand || "--";
            const progression = getProgressionLabel(encounter, previous);

            return (
              <div key={encounter.encounterId} style={timelineRowStyle}>
                <div style={timelineHeaderStyle}>
                  <div>
                    <div style={timelineDateStyle}>
                      {encounter.encounterDateTime || "--"}
                    </div>
                    <div style={mutedStyle}>
                      {encounter.encounterType || "--"} • {encounter.status || "--"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ ...badgeStyle, ...getColorBadgeStyle(displayColor) }}>
                      {displayColor}
                    </span>

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
                  </div>
                </div>

                <RiskBar color={displayColor} />

                <div style={timelineMetricsStyle}>
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
                    <div style={metricLabelStyle}>Progression</div>
                    <div style={metricValueStyleSmall}>{progression}</div>
                  </div>
                </div>

                <div style={detailGridStyle}>
                  <div>
                    <div><strong>Urgency:</strong> {encounter.urgency || "--"}</div>
                    <div style={mutedStyle}>Follow-up: {encounter.followUp || "--"}</div>
                    <div style={mutedStyle}>Confidence: {encounter.confidenceGrade || "--"}</div>
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

      <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/patients" style={linkButtonStyle}>
          Back to Patients
        </Link>
        <Link
          to={`/encounters/new/${encodeURIComponent(patient.patientId)}`}
          style={linkButtonStyle}
        >
          New Encounter
        </Link>
      </div>
    </div>
  );
}

const headerPanelStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  marginBottom: "24px",
  color: "#0f172a",
};

const sectionLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "13px",
  marginBottom: "8px",
};

const headerValueStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#0f172a",
};

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
  color: "#0f172a",
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
  color: "#0f172a",
  marginBottom: "24px",
};

const timelineRowStyle: React.CSSProperties = {
  padding: "20px 0",
  borderBottom: "1px solid #e2e8f0",
};

const timelineHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap",
};

const timelineDateStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "18px",
  color: "#0f172a",
};

const mutedStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
  marginTop: "4px",
};

const timelineMetricsStyle: React.CSSProperties = {
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
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

const linkButtonStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "white",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "10px 16px",
  fontWeight: 700,
};