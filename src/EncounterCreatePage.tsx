import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Encounter, Patient } from "./sharedtype";
import {
  getPatientById,
  upsertEncounter,
} from "./sharedstorage";

const CHIEF_COMPLAINT_OPTIONS = [
  "No complaints, routine check-up",
  "Referred by internal medicine / endocrinology",
  "Blurring of vision",
  "Itching / dryness of eyes",
  "Loss of vision without pain",
  "Patchy central vision loss",
  "Other",
] as const;

const VA_OPTIONS = [
  "1.0",
  "0.9",
  "0.8",
  "0.7",
  "0.6",
  "0.5",
  "0.4",
  "0.3",
  "0.2",
  "Counting fingers at 1 meter",
  "Counting fingers at 0.5 meter",
  "Perception of light",
  "No perception of light",
] as const;

const IOP_OPTIONS = Array.from({ length: 70 }, (_, i) => String(i + 1));

export default function EncounterCreatePage() {
  const { patientId = "" } = useParams();
  const navigate = useNavigate();

  const patient: Patient | null = useMemo(() => getPatientById(patientId), [patientId]);

  const [encounterType, setEncounterType] = useState("Screening");
  const [encounterDateTime, setEncounterDateTime] = useState(getNowForInput());
  const [chiefComplaint, setChiefComplaint] = useState<string>("No complaints, routine check-up");
  const [otherChiefComplaint, setOtherChiefComplaint] = useState("");
  const [symptomsPresent, setSymptomsPresent] = useState(false);
  const [visualAcuityOD, setVisualAcuityOD] = useState("1.0");
  const [visualAcuityOS, setVisualAcuityOS] = useState("1.0");
  const [iopOD, setIopOD] = useState("16");
  const [iopOS, setIopOS] = useState("16");

  if (!patient) {
    return (
      <div>
        <h1>Patient not found</h1>
        <p>Please return to Patients and choose a valid patient.</p>
        <div style={{ marginTop: "20px" }}>
          <Link to="/patients" style={linkButtonStyle}>
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  const finalChiefComplaint =
    chiefComplaint === "Other" ? otherChiefComplaint.trim() : chiefComplaint;

  const handleCreateEncounter = () => {
    if (!encounterType.trim() || !encounterDateTime.trim()) {
      alert("Please enter encounter type and date/time.");
      return;
    }

    if (!finalChiefComplaint) {
      alert("Please select or enter a chief complaint.");
      return;
    }

    const encounterId = `ENC-${Date.now()}`;

    const newEncounter: Encounter = {
      encounterId,
      patientId: patient.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      mrn: patient.mrn,
      displayId: patient.displayId,
      encounterType,
      encounterDateTime,
      chiefComplaint: finalChiefComplaint,
      symptomsPresent,
      visualAcuityOD,
      visualAcuityOS,
      iopOD,
      iopOS,
      status: "Draft",
      lastSavedAt: new Date().toLocaleString(),

      // initialize common fields
      hba1c: "",
      bp: "",
      renalStatus: "",
      drSeverityOD: "",
      drSeverityOS: "",
      dmeOD: "",
      dmeOS: "",

      diabetesDurationYears: "",
      hba1cValue: "",
      hba1cDate: "",
      systolicBP: "",
      diastolicBP: "",
      egfr: "",
      acrStatus: "",
      lipidStatus: "",
      bmi: "",
      smokerStatus: "",
      pregnancyStatus: "",
      endOrganDamageFlag: false,

      bcvaBucketOD: "",
      bcvaBucketOS: "",
      octAvailableOD: false,
      octAvailableOS: false,
      priorAntiVegfOD: false,
      priorAntiVegfOS: false,
      priorPrpOD: false,
      priorPrpOS: false,
      priorVitrectomyOD: false,
      priorVitrectomyOS: false,
      redFlagVHOD: false,
      redFlagVHOS: false,
      redFlagNVDOD: false,
      redFlagNVDOS: false,
      redFlagNVEOD: false,
      redFlagNVEOS: false,
      redFlagTractionOD: false,
      redFlagTractionOS: false,
      redFlagRapidDropOD: false,
      redFlagRapidDropOS: false,

      overdueCategory: "",
      missedFollowupCategory: "",
      octMissingWhenIndicated: false,
      careReliabilityCategory: "",

      ocularScore: undefined,
      systemicScore: undefined,
      reliabilityScore: undefined,
      totalScore: undefined,
      finalColor: undefined,
      riskBand: undefined,
      urgency: undefined,
      followUp: undefined,
      suggestedAction: undefined,
      confidenceGrade: undefined,
      overrideApplied: false,
      overrideReason: "",
    };

    upsertEncounter(newEncounter);
    alert("Encounter created successfully.");
    navigate(`/encounters/workspace/${encodeURIComponent(encounterId)}`);
  };

  return (
    <div>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>Create Encounter</h1>
      <p style={{ fontSize: "18px", color: "#475569", marginBottom: "24px" }}>
        Start a new encounter for this patient with the minimum number of clicks.
      </p>

      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>Patient</h2>
        <div style={patientBoxStyle}>
          <div><strong>Name:</strong> {patient.firstName} {patient.lastName}</div>
          <div><strong>MRN:</strong> {patient.mrn}</div>
          <div><strong>Patient ID:</strong> {patient.patientId}</div>
          <div><strong>Display ID:</strong> {patient.displayId}</div>
          <div><strong>Diabetes Type:</strong> {patient.diabetesType}</div>
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={sectionTitleStyle}>Encounter Starter</h2>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Encounter Type</label>
            <select
              style={inputStyle}
              value={encounterType}
              onChange={(e) => setEncounterType(e.target.value)}
            >
              <option>Screening</option>
              <option>Retina</option>
              <option>Follow-up</option>
              <option>Emergency</option>
              <option>Comprehensive</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Encounter Date/Time</label>
            <input
              type="datetime-local"
              style={inputStyle}
              value={encounterDateTime}
              onChange={(e) => setEncounterDateTime(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Chief Complaint</label>
            <select
              style={inputStyle}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
            >
              {CHIEF_COMPLAINT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {chiefComplaint === "Other" && (
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Other Chief Complaint</label>
              <input
                style={inputStyle}
                value={otherChiefComplaint}
                onChange={(e) => setOtherChiefComplaint(e.target.value)}
                placeholder="Enter complaint"
              />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "end" }}>
            <label style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={symptomsPresent}
                onChange={(e) => setSymptomsPresent(e.target.checked)}
              />
              <span>Symptoms present</span>
            </label>
          </div>

          <div />

          <div>
            <label style={labelStyle}>Visual Acuity OD</label>
            <select
              style={inputStyle}
              value={visualAcuityOD}
              onChange={(e) => setVisualAcuityOD(e.target.value)}
            >
              {VA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Visual Acuity OS</label>
            <select
              style={inputStyle}
              value={visualAcuityOS}
              onChange={(e) => setVisualAcuityOS(e.target.value)}
            >
              {VA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>IOP OD</label>
            <select
              style={inputStyle}
              value={iopOD}
              onChange={(e) => setIopOD(e.target.value)}
            >
              {IOP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>IOP OS</label>
            <select
              style={inputStyle}
              value={iopOS}
              onChange={(e) => setIopOS(e.target.value)}
            >
              {IOP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: "18px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "14px",
            color: "#475569",
            fontSize: "14px",
          }}
        >
          Tip: keep this page for quick entry only. Detailed diabetic retinopathy scoring and interpretation happens in the Encounter Workspace.
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
          <button style={buttonPrimaryStyle} onClick={handleCreateEncounter}>
            Create Encounter
          </button>

          <Link to="/patients" style={linkButtonStyle}>
            Back to Patients
          </Link>
        </div>
      </div>
    </div>
  );
}

function getNowForInput() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
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

const patientBoxStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
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

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "15px",
  color: "#0f172a",
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