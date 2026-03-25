import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import PatientsPage from "./PatientsPage";
import EncounterCreatePage from "./EncounterCreatePage";
import EncounterWorkspacePage from "./EncounterWorkspacePage";
import EncounterQueuePage from "./EncounterQueuePage";
import PatientTimelinePage from "./PatientTimelinePage";
import ReportsPage from "./ReportsPage";
import ReportQrLandingPage from "./ReportQrLandingPage";
import ReportVerifyPage from "./ReportVerifyPage";
import ReportOtpPage from "./ReportOtpPage";
import DetailedReportPage from "./DetailedReportPage";
import { loadEncounters, loadPatients } from "./sharedstorage";
import "./App.css";

function DashboardPage() {
  const patients = loadPatients();
  const encounters = loadEncounters();

  const totalPatients = patients.length;
  const totalEncounters = encounters.length;
  const draftCount = encounters.filter((e) => e.status === "Draft").length;
  const savedCount = encounters.filter((e) => e.status === "Saved").length;
  const completedCount = encounters.filter((e) => e.status === "Completed").length;

  const greenCount = encounters.filter((e) => (e.finalColor || e.riskBand) === "Green").length;
  const yellowCount = encounters.filter((e) => (e.finalColor || e.riskBand) === "Yellow").length;
  const orangeCount = encounters.filter((e) => (e.finalColor || e.riskBand) === "Orange").length;
  const redCount = encounters.filter((e) => (e.finalColor || e.riskBand) === "Red").length;

  const encountersByPatient = patients.map((patient) => {
    const patientEncounters = encounters.filter((e) => e.patientId === patient.patientId);
    const latestEncounter = patientEncounters
      .slice()
      .sort((a, b) => {
        const aTime = Date.parse(a.encounterDateTime || "") || 0;
        const bTime = Date.parse(b.encounterDateTime || "") || 0;
        return bTime - aTime;
      })[0];

    return {
      patient,
      encounterCount: patientEncounters.length,
      latestEncounter,
    };
  });

  const highRiskEncounters = encounters
    .filter((e) => {
      const color = e.finalColor || e.riskBand;
      return color === "Orange" || color === "Red";
    })
    .slice()
    .sort((a, b) => {
      const aTime = Date.parse(a.encounterDateTime || "") || 0;
      const bTime = Date.parse(b.encounterDateTime || "") || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>Dashboard</h1>
      <p style={{ fontSize: "18px", color: "#475569", marginBottom: "24px" }}>
        Monitor patient and encounter activity.
      </p>

      <div style={summaryGridStyle}>
        <DashboardCard label="Total Patients" value={String(totalPatients)} />
        <DashboardCard label="Total Encounters" value={String(totalEncounters)} />
        <DashboardCard label="Draft / Saved" value={`${draftCount} / ${savedCount}`} />
        <DashboardCard label="Completed" value={String(completedCount)} />
      </div>

      <div style={summaryGridStyle}>
        <DashboardCard label="Green" value={String(greenCount)} tone="green" />
        <DashboardCard label="Yellow" value={String(yellowCount)} tone="yellow" />
        <DashboardCard label="Orange" value={String(orangeCount)} tone="orange" />
        <DashboardCard label="Red" value={String(redCount)} tone="red" />
      </div>

      <div style={twoPanelGridStyle}>
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Recent High-Risk Encounters</h2>

          {highRiskEncounters.length === 0 ? (
            <div style={mutedStyle}>No high-risk encounters yet.</div>
          ) : (
            highRiskEncounters.map((encounter) => (
              <div key={encounter.encounterId} style={listRowStyle}>
                <div>
                  <div style={nameStyle}>
                    {encounter.firstName} {encounter.lastName}
                  </div>
                  <div style={mutedStyle}>
                    {encounter.encounterType || "--"} • {encounter.encounterDateTime || "--"}
                  </div>
                  <div style={mutedStyle}>
                    Total: {encounter.totalScore ?? "--"} • Ocular: {encounter.ocularScore ?? "--"} •
                    Systemic: {encounter.systemicScore ?? "--"} • Reliability: {encounter.reliabilityScore ?? "--"}
                  </div>
                  <div style={mutedStyle}>
                    Urgency: {encounter.urgency || "--"} • Follow-up: {encounter.followUp || "--"}
                  </div>
                </div>

                <div style={badgeWrapStyle}>
                  <span style={getColorBadgeStyle(encounter.finalColor || encounter.riskBand)}>
                    {encounter.finalColor || encounter.riskBand || "--"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Operational Snapshot</h2>

          <div style={metricLineStyle}>
            <span>Saved encounters needing completion</span>
            <strong>{savedCount}</strong>
          </div>
          <div style={metricLineStyle}>
            <span>Draft encounters</span>
            <strong>{draftCount}</strong>
          </div>
          <div style={metricLineStyle}>
            <span>Red encounters</span>
            <strong>{redCount}</strong>
          </div>
          <div style={metricLineStyle}>
            <span>Orange + Red encounters</span>
            <strong>{orangeCount + redCount}</strong>
          </div>
          <div style={metricLineStyle}>
            <span>Patients with any encounter</span>
            <strong>{encountersByPatient.filter((x) => x.encounterCount > 0).length}</strong>
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={panelTitleStyle}>Patient Overview</h2>

        {encountersByPatient.length === 0 ? (
          <div style={mutedStyle}>No patients available.</div>
        ) : (
          encountersByPatient.map(({ patient, encounterCount, latestEncounter }) => (
            <div key={patient.patientId} style={listRowStyle}>
              <div>
                <div style={nameStyle}>
                  {patient.firstName} {patient.lastName}
                </div>
                <div style={mutedStyle}>
                  {patient.patientId} • {patient.displayId}
                </div>
                <div style={mutedStyle}>MRN: {patient.mrn}</div>
              </div>

              <div>
                <div style={nameStyle}>Encounters: {encounterCount}</div>
                <div style={mutedStyle}>Latest status: {latestEncounter?.status || "--"}</div>
              </div>

              <div>
                <div style={nameStyle}>Latest score: {latestEncounter?.totalScore ?? "--"}</div>
                <div style={mutedStyle}>Urgency: {latestEncounter?.urgency || "--"}</div>
              </div>

              <div style={badgeWrapStyle}>
                <span style={getColorBadgeStyle(latestEncounter?.finalColor || latestEncounter?.riskBand)}>
                  {latestEncounter?.finalColor || latestEncounter?.riskBand || "--"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "yellow" | "orange" | "red";
}) {
  let background = "white";
  let border = "1px solid #e2e8f0";
  let color = "#0f172a";

  if (tone === "green") {
    background = "#dcfce7";
    border = "1px solid #86efac";
    color = "#166534";
  } else if (tone === "yellow") {
    background = "#fef9c3";
    border = "1px solid #fde047";
    color = "#854d0e";
  } else if (tone === "orange") {
    background = "#ffedd5";
    border = "1px solid #fdba74";
    color = "#9a3412";
  } else if (tone === "red") {
    background = "#fee2e2";
    border = "1px solid #fca5a5";
    color = "#991b1b";
  }

  return (
    <div
      style={{
        background,
        border,
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "14px", color: tone ? color : "#64748b", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "34px", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function AppLayout() {
  return (
    <div style={appShellStyle}>
      <nav style={navStyle}>
        <Link to="/">Dashboard</Link>
        <Link to="/patients">Patients</Link>
        <Link to="/encounters/queue">Encounter Queue</Link>
      </nav>

      <div style={pageContainerStyle}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/encounters/new/:patientId" element={<EncounterCreatePage />} />
          <Route path="/encounters/workspace/:encounterId" element={<EncounterWorkspacePage />} />
          <Route path="/encounters/queue" element={<EncounterQueuePage />} />
          <Route path="/patients/:patientId/timeline" element={<PatientTimelinePage />} />
          <Route path="/encounters/:encounterId/reports" element={<ReportsPage />} />

          <Route path="/r/:token" element={<ReportQrLandingPage />} />
          <Route path="/r/:token/verify" element={<ReportVerifyPage />} />
          <Route path="/r/:token/otp" element={<ReportOtpPage />} />
          <Route path="/r/:token/report" element={<DetailedReportPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function getColorBadgeStyle(color?: string): React.CSSProperties {
  switch (color) {
    case "Green":
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #86efac",
        fontWeight: 700,
        fontSize: "13px",
      };
    case "Yellow":
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "#fef9c3",
        color: "#854d0e",
        border: "1px solid #fde047",
        fontWeight: 700,
        fontSize: "13px",
      };
    case "Orange":
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "#ffedd5",
        color: "#9a3412",
        border: "1px solid #fdba74",
        fontWeight: 700,
        fontSize: "13px",
      };
    case "Red":
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fca5a5",
        fontWeight: 700,
        fontSize: "13px",
      };
    default:
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "#e2e8f0",
        color: "#334155",
        border: "1px solid #cbd5e1",
        fontWeight: 700,
        fontSize: "13px",
      };
  }
}

const appShellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e2e8f0",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  padding: "24px 24px 0 24px",
  fontSize: "16px",
};

const pageContainerStyle: React.CSSProperties = {
  padding: "24px",
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const twoPanelGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.25fr 1fr",
  gap: "16px",
  marginBottom: "24px",
};

const panelStyle: React.CSSProperties = {
  background: "white",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  marginBottom: "24px",
};

const panelTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "18px",
  fontSize: "24px",
  fontWeight: 800,
};

const listRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr 1fr auto",
  gap: "16px",
  alignItems: "center",
  padding: "16px 0",
  borderBottom: "1px solid #e2e8f0",
};

const nameStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 800,
  color: "#0f172a",
};

const mutedStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "14px",
  marginTop: "4px",
};

const badgeWrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
};

const metricLineStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "16px",
};