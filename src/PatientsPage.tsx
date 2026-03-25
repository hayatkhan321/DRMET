import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Encounter, Patient } from "./sharedtype";
import {
  buildPatient,
  getLatestEncounterForPatient,
  loadEncounters,
  loadPatients,
  savePatients,
} from "./sharedstorage";

export default function PatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>(loadPatients());
  const [encounters] = useState<Encounter[]>(loadEncounters());

  const [search, setSearch] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mrn, setMrn] = useState("");
  const [diabetesType, setDiabetesType] = useState("Type 2");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<"Male" | "Female" | "Other" | "Unknown">("Unknown");

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        patient.firstName.toLowerCase().includes(q) ||
        patient.lastName.toLowerCase().includes(q) ||
        (patient.mrn || "").toLowerCase().includes(q) ||
        (patient.patientId || "").toLowerCase().includes(q) ||
        (patient.displayId || "").toLowerCase().includes(q)
      );
    });
  }, [patients, search]);

  const handleRegisterPatient = () => {
    if (!firstName.trim() || !lastName.trim() || !mrn.trim()) {
      alert("Please enter first name, last name, and MRN.");
      return;
    }

    const nextNumber = patients.length + 1;
    const newPatient = buildPatient(
      firstName.trim(),
      lastName.trim(),
      mrn.trim(),
      diabetesType,
      nextNumber
    );

    newPatient.dateOfBirth = dateOfBirth || undefined;
    newPatient.sex = sex;
    newPatient.updatedAt = new Date().toISOString();

    const updatedPatients = [...patients, newPatient];
    savePatients(updatedPatients);
    setPatients(updatedPatients);

    setFirstName("");
    setLastName("");
    setMrn("");
    setDiabetesType("Type 2");
    setDateOfBirth("");
    setSex("Unknown");

    alert("Patient registered successfully.");
  };

  const latestEncounterFor = (patientId: string) => getLatestEncounterForPatient(patientId);

  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>Patients</h1>
      <p style={{ fontSize: "18px", color: "#475569", marginBottom: "24px" }}>
        Register, search, and manage patient records.
      </p>

      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>Search Patients</h2>
        <input
          style={inputStyle}
          placeholder="Search by name, MRN, Patient ID, or Display ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>Register New Patient</h2>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input
              style={inputStyle}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              style={inputStyle}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>MRN</label>
            <input
              style={inputStyle}
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Diabetes Type</label>
            <select
              style={inputStyle}
              value={diabetesType}
              onChange={(e) => setDiabetesType(e.target.value)}
            >
              <option>Type 1</option>
              <option>Type 2</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              style={inputStyle}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Sex</label>
            <select
              style={inputStyle}
              value={sex}
              onChange={(e) =>
                setSex(e.target.value as "Male" | "Female" | "Other" | "Unknown")
              }
            >
              <option>Unknown</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <button style={buttonPrimaryStyle} onClick={handleRegisterPatient}>
          Register Patient
        </button>
      </div>

      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>Saved Patients</h2>

        {filteredPatients.length === 0 ? (
          <p style={{ color: "#64748b" }}>No patients found.</p>
        ) : (
          filteredPatients.map((patient) => {
            const latest = latestEncounterFor(patient.patientId);
            const patientEncounterCount = encounters.filter(
              (e) => e.patientId === patient.patientId
            ).length;
            const displayColor = latest?.finalColor || latest?.riskBand || "--";

            return (
              <div key={patient.patientId} style={patientRowStyle}>
                <div style={{ flex: 1.6, minWidth: "260px" }}>
                  <div style={nameStyle}>
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div style={mutedStyle}>
                    {patient.patientId} • {patient.displayId}
                  </div>
                  <div style={mutedStyle}>MRN: {patient.mrn}</div>
                  <div style={mutedStyle}>
                    {patient.diabetesType || "--"} • DOB: {patient.dateOfBirth || "--"} • Sex:{" "}
                    {patient.sex || "--"}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div><strong>Encounters:</strong> {patientEncounterCount}</div>
                  <div style={mutedStyle}>
                    Latest date: {latest?.encounterDateTime || "--"}
                  </div>
                  <div style={mutedStyle}>Latest score: {latest?.totalScore ?? "--"}</div>
                </div>

                <div style={{ minWidth: "120px", display: "flex", alignItems: "center" }}>
                  <span style={{ ...badgeStyle, ...getColorBadgeStyle(displayColor) }}>
                    {displayColor}
                  </span>
                </div>

                <div style={buttonGroupStyle}>
                  {latest ? (
                    <button
                      style={buttonSecondaryStyle}
                      onClick={() =>
                        navigate(`/encounters/workspace/${encodeURIComponent(latest.encounterId)}`)
                      }
                    >
                      Open Latest
                    </button>
                  ) : (
                    <button
                      style={buttonSecondaryStyle}
                      onClick={() =>
                        navigate(`/encounters/new/${encodeURIComponent(patient.patientId)}`)
                      }
                    >
                      New Encounter
                    </button>
                  )}

                  <button
                    style={buttonPrimaryStyle}
                    onClick={() =>
                      navigate(`/encounters/new/${encodeURIComponent(patient.patientId)}`)
                    }
                  >
                    New Encounter
                  </button>

                  <button
                    style={buttonSecondaryStyle}
                    onClick={() =>
                      navigate(`/patients/${encodeURIComponent(patient.patientId)}/timeline`)
                    }
                  >
                    Timeline
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

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

const panelStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  color: "#0f172a",
  marginBottom: "24px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  marginTop: 0,
  marginBottom: "16px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  color: "#334155",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  boxSizing: "border-box",
};

const patientRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  alignItems: "center",
  padding: "18px 0",
  borderBottom: "1px solid #e2e8f0",
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

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginLeft: "auto",
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

const buttonSecondaryStyle: React.CSSProperties = {
  background: "white",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 700,
};