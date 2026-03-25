import { Link, useParams } from "react-router-dom";
import type { DoctorReport, Encounter, PatientReport } from "./sharedtype";
import { formatEncounterColor, getEncounterById } from "./sharedstorage";
import RiskBar from "./RiskBar";
import GaugeCard from "./GaugeCard";
import TopDriversCard from "./TopDriversCard";

function safe(value?: string | number | boolean | null) {
  if (value === undefined || value === null || value === "") return "--";
  return String(value);
}

function buildDoctorReport(encounter: Encounter): DoctorReport {
  const patientName = `${encounter.firstName} ${encounter.lastName}`.trim();
  const finalColor = formatEncounterColor(encounter);

  const summaryLines: string[] = [];

  if (encounter.topDriver1) summaryLines.push(encounter.topDriver1);
  if (encounter.topDriver2) summaryLines.push(encounter.topDriver2);
  if (encounter.topDriver3) summaryLines.push(encounter.topDriver3);

  if (summaryLines.length === 0) {
    if (encounter.drSeverityOD || encounter.drSeverityOS) {
      summaryLines.push(
        `Retinopathy severity recorded as OD: ${safe(encounter.drSeverityOD)}, OS: ${safe(encounter.drSeverityOS)}.`
      );
    }
    if (encounter.dmeOD || encounter.dmeOS) {
      summaryLines.push(
        `Macular edema status recorded as OD: ${safe(encounter.dmeOD)}, OS: ${safe(encounter.dmeOS)}.`
      );
    }
  }

  if (summaryLines.length === 0) {
    summaryLines.push("Structured scoring data not fully available for this encounter.");
  }

  return {
    encounterId: encounter.encounterId,
    patientName,
    patientId: encounter.patientId,
    displayId: encounter.displayId,
    mrn: encounter.mrn,
    encounterDateTime: encounter.encounterDateTime,
    encounterType: encounter.encounterType,
    ocularScore: encounter.ocularScore ?? null,
    systemicScore: encounter.systemicScore ?? null,
    reliabilityScore: encounter.reliabilityScore ?? null,
    totalScore: encounter.totalScore ?? null,
    finalColor,
    urgency: encounter.urgency || "--",
    followUp: encounter.followUp || "--",
    suggestedAction: encounter.suggestedAction || "--",
    confidenceGrade: encounter.confidenceGrade || "--",
    overrideApplied: !!encounter.overrideApplied,
    overrideReason: encounter.overrideReason || "",
    summaryLines,
  };
}

function buildPatientReport(encounter: Encounter): PatientReport {
  const patientName = `${encounter.firstName} ${encounter.lastName}`.trim();
  const finalColor = formatEncounterColor(encounter);

  const simpleSummary: string[] = [];

  if (finalColor === "Green") {
    simpleSummary.push("Your diabetic eye assessment is currently in the green zone.");
    simpleSummary.push("This usually means no urgent retinal threat is identified at this visit.");
  } else if (finalColor === "Yellow") {
    simpleSummary.push("Your diabetic eye assessment is currently in the yellow zone.");
    simpleSummary.push("This means there are changes that need closer review and follow-up.");
  } else if (finalColor === "Orange") {
    simpleSummary.push("Your diabetic eye assessment is currently in the orange zone.");
    simpleSummary.push("This means there is meaningful eye disease risk and retina-directed review is advised.");
  } else if (finalColor === "Red") {
    simpleSummary.push("Your diabetic eye assessment is currently in the red zone.");
    simpleSummary.push("This means urgent retinal review is advised because your eye findings may be vision-threatening.");
  } else {
    simpleSummary.push("Your diabetic eye assessment has been recorded.");
  }

  if (encounter.followUp) {
    simpleSummary.push(`Recommended follow-up: ${encounter.followUp}.`);
  }

  if (encounter.suggestedAction) {
    simpleSummary.push(`Next step: ${encounter.suggestedAction}`);
  }

  simpleSummary.push(
    "Please control your blood sugar, blood pressure, and keep all eye follow-up appointments."
  );

  if (finalColor === "Orange" || finalColor === "Red") {
    simpleSummary.push(
      "Return urgently if you notice sudden drop in vision, new floaters, distortion, or a dark curtain in vision."
    );
  }

  return {
    encounterId: encounter.encounterId,
    patientName,
    finalColor,
    urgency: encounter.urgency || "--",
    followUp: encounter.followUp || "--",
    suggestedAction: encounter.suggestedAction || "--",
    simpleSummary,
  };
}

export default function ReportsPage() {
  const { encounterId = "" } = useParams();
  const encounter = getEncounterById(encounterId);

  if (!encounter) {
    return (
      <div style={pageStyle}>
        <div style={contentStyle}>
          <div style={panelStyle}>
            <h1>Report not found</h1>
            <p>No encounter could be found for this report.</p>
            <Link to="/encounters/queue" style={linkButtonStyle}>
              Back to Encounter Queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const doctorReport = buildDoctorReport(encounter);
  const patientReport = buildPatientReport(encounter);

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <div style={headerCardStyle}>
          <div>
            <div style={smallLabelStyle}>DRMET Structured Report</div>
            <h1 style={titleStyle}>Clinical and Patient Report</h1>
            <div style={subtleTextStyle}>
              {doctorReport.patientName} • {doctorReport.encounterType} • {doctorReport.encounterDateTime}
            </div>
          </div>

          <div style={actionRowStyle}>
            <Link
              to={`/encounters/workspace/${encodeURIComponent(encounter.encounterId)}`}
              style={linkButtonStyle}
            >
              Back to Workspace
            </Link>
            <button style={primaryButtonStyle} onClick={() => window.print()}>
              Print / Save PDF
            </button>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Report Header</h2>
          <div style={metaGridStyle}>
            <div style={metaCardStyle}><strong>Patient:</strong> {doctorReport.patientName}</div>
            <div style={metaCardStyle}><strong>MRN:</strong> {doctorReport.mrn}</div>
            <div style={metaCardStyle}><strong>Patient ID:</strong> {doctorReport.patientId}</div>
            <div style={metaCardStyle}><strong>Display ID:</strong> {doctorReport.displayId}</div>
            <div style={metaCardStyle}><strong>Encounter Type:</strong> {doctorReport.encounterType}</div>
            <div style={metaCardStyle}><strong>Date / Time:</strong> {doctorReport.encounterDateTime}</div>
          </div>
        </div>

        <div style={panelStyle}>
          <RiskBar
            color={doctorReport.finalColor}
            title="Patient Risk Position"
            subtitle="This strip shows where the patient currently sits between lower-risk Green and higher-risk Red."
          />
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Domain Gauges</h2>
          <div style={gaugesGridStyle}>
            <GaugeCard
              title="Retinopathy Severity"
              score={encounter.retinopathyScore ?? null}
              max={20}
              driver={encounter.topOcularDriver || encounter.topDriver1}
            />
            <GaugeCard
              title="Macular / DME"
              score={encounter.macularScore ?? null}
              max={14}
              driver={encounter.topDriver2 || encounter.topOcularDriver}
            />
            <GaugeCard
              title="Systemic"
              score={encounter.systemicScore ?? null}
              max={12}
              driver={encounter.topSystemicDriver}
            />
            <GaugeCard
              title="Safety / Reliability"
              score={encounter.safetyReliabilityScore ?? null}
              max={10}
              driver={encounter.topSafetyDriver}
            />
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Clinical Summary</h2>

          <div style={scoreGridStyle}>
            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Retinopathy</div>
              <div style={scoreValueStyle}>{safe(encounter.retinopathyScore)}</div>
            </div>
            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Macular</div>
              <div style={scoreValueStyle}>{safe(encounter.macularScore)}</div>
            </div>
            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Systemic</div>
              <div style={scoreValueStyle}>{safe(encounter.systemicScore)}</div>
            </div>
            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Safety / Reliability</div>
              <div style={scoreValueStyle}>{safe(encounter.safetyReliabilityScore)}</div>
            </div>
          </div>

          <div style={detailBoxStyle}>
            <p><strong>Total Score:</strong> {safe(doctorReport.totalScore)}</p>
            <p><strong>Final Color:</strong> {doctorReport.finalColor}</p>
            <p><strong>V2 Risk Band:</strong> {encounter.riskBandV2 || "--"}</p>
            <p><strong>Urgency:</strong> {doctorReport.urgency}</p>
            <p><strong>Follow-up:</strong> {doctorReport.followUp}</p>
            <p><strong>Suggested Action:</strong> {doctorReport.suggestedAction}</p>
            <p><strong>Confidence:</strong> {doctorReport.confidenceGrade}</p>
            <p><strong>Override Applied:</strong> {doctorReport.overrideApplied ? "Yes" : "No"}</p>
            {doctorReport.overrideApplied && (
              <p><strong>Override Reason:</strong> {doctorReport.overrideReason}</p>
            )}
          </div>
        </div>

        <div style={panelStyle}>
          <TopDriversCard
            topDriver1={encounter.topDriver1}
            topDriver2={encounter.topDriver2}
            topDriver3={encounter.topDriver3}
            topOcularDriver={encounter.topOcularDriver}
            topSystemicDriver={encounter.topSystemicDriver}
            topSafetyDriver={encounter.topSafetyDriver}
          />
        </div>

        <div style={twoColumnGridStyle}>
          <div style={panelStyle}>
            <h2 style={sectionTitleStyle}>Patient Counseling Summary</h2>
            <div style={detailBoxStyle}>
              <p><strong>Patient:</strong> {patientReport.patientName}</p>
              <p><strong>Risk Zone:</strong> {patientReport.finalColor}</p>
              <p><strong>Urgency:</strong> {patientReport.urgency}</p>
              <p><strong>Follow-up:</strong> {patientReport.followUp}</p>
            </div>

            <h3 style={subSectionTitleStyle}>Simple Explanation</h3>
            <ul style={listStyle}>
              {patientReport.simpleSummary.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>

          <div style={panelStyle}>
            <h2 style={sectionTitleStyle}>Secure Detailed Report Access</h2>
            <div style={qrPlaceholderStyle}>
              <div style={qrBoxStyle}>QR</div>
              <div style={{ flex: 1 }}>
                <div style={qrTitleStyle}>Secure QR Placeholder</div>
                <div style={qrTextStyle}>
                  This QR will point to the secure generated detailed report page, including progression,
                  prior visits, and future external records.
                </div>
                <div style={qrTextStyle}>
                  Access model: secure server-side validation first, optional stronger verification if needed.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Report Footer</h2>
          <div
            style={{
              paddingTop: "4px",
              fontSize: "12px",
              lineHeight: 1.55,
              color: "#64748b",
            }}
          >
            <div>
              This structured report references current diabetic eye screening, referral, and follow-up
              principles from the ADA Standards of Care in Diabetes and ophthalmic diabetic retinopathy guidance.<sup>1,2</sup>
            </div>
            <div style={{ marginTop: "10px" }}>
              <strong>References</strong>
            </div>
            <div>1. ADA Standards of Care in Diabetes — Retinopathy section.</div>
            <div>2. Ophthalmic diabetic retinopathy screening and follow-up guidance.</div>
          </div>
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
  maxWidth: "1240px",
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

const panelStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
  color: "#0f172a",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "16px",
  fontSize: "24px",
  fontWeight: 800,
  color: "#0f172a",
};

const subSectionTitleStyle: React.CSSProperties = {
  marginTop: "18px",
  marginBottom: "10px",
  fontSize: "18px",
  fontWeight: 800,
  color: "#0f172a",
};

const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
};

const metaCardStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
  color: "#334155",
};

const gaugesGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
};

const scoreGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const scoreCardStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
};

const scoreLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
  marginBottom: "8px",
};

const scoreValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#0f172a",
};

const detailBoxStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
  color: "#334155",
};

const twoColumnGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "22px",
  color: "#334155",
  lineHeight: 1.55,
};

const qrPlaceholderStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  alignItems: "flex-start",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
};

const qrBoxStyle: React.CSSProperties = {
  width: "96px",
  height: "96px",
  border: "2px dashed #94a3b8",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  color: "#475569",
  background: "white",
  flexShrink: 0,
};

const qrTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: "8px",
};

const qrTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#475569",
  lineHeight: 1.5,
  marginBottom: "8px",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#0f172a",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
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
  padding: "12px 18px",
  fontWeight: 700,
};