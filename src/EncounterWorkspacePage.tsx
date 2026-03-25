import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Encounter, EncounterStatus, FinalColor } from "./sharedtype";
import { loadEncounters, saveEncounters } from "./sharedstorage";
import RiskBar from "./RiskBar";
import GaugeCard from "./GaugeCard";
import TopDriversCard from "./TopDriversCard";

const DURATION_OPTIONS = Array.from({ length: 51 }, (_, i) => String(i));
const SYSTOLIC_OPTIONS = Array.from({ length: 171 }, (_, i) => String(i + 80));
const DIASTOLIC_OPTIONS = Array.from({ length: 111 }, (_, i) => String(i + 40));
const EGFR_OPTIONS = Array.from({ length: 150 }, (_, i) => String(i + 1));

const BMI_CATEGORY_OPTIONS = [
  { label: "Underweight (<18.5)", value: "17" },
  { label: "Normal (18.5–24.9)", value: "22" },
  { label: "Overweight (25–29.9)", value: "27" },
  { label: "Obesity class I (30–34.9)", value: "32" },
  { label: "Obesity class II (35–39.9)", value: "37" },
  { label: "Obesity class III (≥40)", value: "42" },
];

function normalizeDrGrade(value?: string) {
  const v = (value || "").trim().toLowerCase();
  if (v === "no dr" || v === "no_dr") return "no_dr";
  if (v === "mild npdr" || v === "mild_npdr") return "mild_npdr";
  if (v === "moderate npdr" || v === "moderate_npdr") return "moderate_npdr";
  if (v === "severe npdr" || v === "severe_npdr") return "severe_npdr";
  if (v === "pdr") return "pdr";
  return "";
}

function normalizeDme(value?: string) {
  const v = (value || "").trim().toLowerCase();
  if (v === "no dme" || v === "none") return "none";
  if (v === "non-center" || v === "non_center") return "non_center";
  if (v === "center-suspected" || v === "center_suspected") return "center_suspected";
  if (v === "center-confirmed" || v === "center_confirmed" || v === "center_confirmed_oct") {
    return "center_confirmed";
  }
  return "";
}

function parseNumber(value?: string) {
  const n = parseFloat((value || "").trim());
  return Number.isNaN(n) ? null : n;
}

function retinopathyBasePoints(grade?: string) {
  switch (normalizeDrGrade(grade)) {
    case "no_dr":
      return 0;
    case "mild_npdr":
      return 2;
    case "moderate_npdr":
      return 5;
    case "severe_npdr":
      return 8;
    case "pdr":
      return 12;
    default:
      return 0;
  }
}

function macularBasePoints(dme?: string) {
  switch (normalizeDme(dme)) {
    case "none":
      return 0;
    case "non_center":
      return 2;
    case "center_suspected":
      return 4;
    case "center_confirmed":
      return 6;
    default:
      return 0;
  }
}

function bcvaPoints(bucket?: string) {
  switch (bucket) {
    case "20_25_or_better":
      return 0;
    case "20_30_to_20_40":
      return 1;
    case "20_50_to_20_80":
      return 2;
    case "20_100_to_20_200":
      return 3;
    case "worse_than_20_200":
      return 4;
    default:
      return 0;
  }
}

function eyeRetinopathyScore(side: "OD" | "OS", e: Encounter) {
  const dr = side === "OD" ? e.drSeverityOD : e.drSeverityOS;
  const nvd = side === "OD" ? (e.activeNVDOD ?? e.redFlagNVDOD) : (e.activeNVDOS ?? e.redFlagNVDOS);
  const nve = side === "OD" ? (e.activeNVEOD ?? e.redFlagNVEOD) : (e.activeNVEOS ?? e.redFlagNVEOS);
  const vh = side === "OD" ? (e.vhOD ?? e.redFlagVHOD) : (e.vhOS ?? e.redFlagVHOS);
  const traction = side === "OD" ? (e.tractionOD ?? e.redFlagTractionOD) : (e.tractionOS ?? e.redFlagTractionOS);
  const rapidDrop = side === "OD" ? (e.rapidDropVisitOD ?? e.redFlagRapidDropOD) : (e.rapidDropVisitOS ?? e.redFlagRapidDropOS);

  let modifier = 0;
  if (nvd || nve) modifier = Math.max(modifier, 4);
  if (vh) modifier = Math.max(modifier, 4);
  if (traction) modifier = Math.max(modifier, 4);
  if (rapidDrop) modifier = Math.max(modifier, 4);

  return Math.min(retinopathyBasePoints(dr) + modifier, 20);
}

function eyeMacularScore(side: "OD" | "OS", e: Encounter) {
  const dme = side === "OD" ? e.dmeOD : e.dmeOS;
  const bcva = side === "OD" ? e.bcvaBucketOD : e.bcvaBucketOS;
  const centerInvolving = side === "OD" ? e.centerInvolvingOD : e.centerInvolvingOS;
  const irf = side === "OD" ? e.irfOD : e.irfOS;
  const srf = side === "OD" ? e.srfOD : e.srfOS;
  const cmt = parseNumber(side === "OD" ? e.centralMacularThicknessOD : e.centralMacularThicknessOS);

  let score = macularBasePoints(dme) + bcvaPoints(bcva);

  if (centerInvolving) score += 1;
  if (irf) score += 1;
  if (srf) score += 1;
  if (cmt !== null && cmt >= 400) score += 2;
  else if (cmt !== null && cmt >= 300) score += 1;

  return Math.min(score, 14);
}

function systemicScoreCalc(e: Encounter) {
  let score = 0;

  const hba1c = parseNumber(e.hba1cValue || e.hba1c);
  if (hba1c !== null) {
    if (hba1c < 7) score += 0;
    else if (hba1c < 8) score += 1;
    else if (hba1c < 9) score += 2;
    else if (hba1c < 10) score += 3;
    else score += 4;
  }

  const duration = parseNumber(e.diabetesDurationYears);
  if (duration !== null) {
    if (duration < 5) score += 0;
    else if (duration < 10) score += 1;
    else if (duration < 15) score += 2;
    else score += 3;
  }

  let systolic = parseNumber(e.systolicBP);
  let diastolic = parseNumber(e.diastolicBP);

  if ((systolic === null || diastolic === null) && e.bp) {
    const match = e.bp.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      systolic = parseFloat(match[1]);
      diastolic = parseFloat(match[2]);
    }
  }

  if (systolic !== null && diastolic !== null) {
    if (systolic < 140 && diastolic < 80) score += 0;
    else if (systolic < 160 && diastolic < 90) score += 1;
    else score += 2;

    if (e.endOrganDamageFlag && (systolic >= 130 || diastolic >= 80)) score += 1;
  }

  const egfr = parseNumber(e.egfr);
  const renalLegacy = (e.renalStatus || "").toLowerCase();
  const albuminuria =
    e.acrStatus === "microalbuminuria" ||
    e.acrStatus === "macroalbuminuria";

  const reducedEgfr =
    egfr !== null ? egfr < 60 : renalLegacy.includes("ckd") || renalLegacy.includes("reduced");

  if (albuminuria && reducedEgfr) score += 3;
  else if (albuminuria || reducedEgfr) score += 2;

  let modifiers = 0;
  if (e.lipidStatus === "not_at_target") modifiers += 1;
  const bmi = parseNumber(e.bmi);
  if (bmi !== null && bmi >= 30) modifiers += 1;
  if (e.smokerStatus === "current") modifiers += 1;

  score += Math.min(modifiers, 2);
  return Math.min(score, 12);
}

function safetyReliabilityScoreCalc(e: Encounter) {
  let score = 0;

  if (e.overdueCategory === "overdue_lt_6m") score += 1;
  if (e.overdueCategory === "overdue_ge_6m") score += 2;

  if (e.missedFollowupCategory === "one") score += 1;
  if (e.missedFollowupCategory === "repeated") score += 2;

  if (e.octMissingWhenIndicated) score += 1;

  if (e.careReliabilityCategory === "concern") score += 1;
  if (e.careReliabilityCategory === "major_concern") score += 2;

  if (e.ungradableFlagOD || e.ungradableFlagOS) score += 2;

  return Math.min(score, 10);
}

type DriverCandidate = { text: string; weight: number; domain: "ocular" | "systemic" | "safety" };

function buildDrivers(e: Encounter, retinopathyScore: number, macularScore: number) {
  const drivers: DriverCandidate[] = [];

  const drOD = normalizeDrGrade(e.drSeverityOD);
  const drOS = normalizeDrGrade(e.drSeverityOS);
  const dmeOD = normalizeDme(e.dmeOD);
  const dmeOS = normalizeDme(e.dmeOS);

  if (drOD === "pdr" || drOS === "pdr") {
    drivers.push({ text: "Proliferative diabetic retinopathy present", weight: 12, domain: "ocular" });
  } else if (drOD === "severe_npdr" || drOS === "severe_npdr") {
    drivers.push({ text: "Severe NPDR present", weight: 9, domain: "ocular" });
  } else if (drOD === "moderate_npdr" || drOS === "moderate_npdr") {
    drivers.push({ text: "Moderate NPDR present", weight: 6, domain: "ocular" });
  }

  if (e.activeNVDOD || e.activeNVDOS || e.activeNVEOD || e.activeNVEOS || e.redFlagNVDOD || e.redFlagNVDOS || e.redFlagNVEOD || e.redFlagNVEOS) {
    drivers.push({ text: "Active retinal neovascularization", weight: 14, domain: "ocular" });
  }

  if (e.vhOD || e.vhOS || e.redFlagVHOD || e.redFlagVHOS) {
    drivers.push({ text: "Vitreous hemorrhage present", weight: 14, domain: "ocular" });
  }

  if (e.tractionOD || e.tractionOS || e.redFlagTractionOD || e.redFlagTractionOS) {
    drivers.push({ text: "Traction concern present", weight: 14, domain: "ocular" });
  }

  if (dmeOD === "center_confirmed" || dmeOS === "center_confirmed") {
    drivers.push({ text: "Center-confirmed DME present", weight: 10, domain: "ocular" });
  } else if (dmeOD === "center_suspected" || dmeOS === "center_suspected") {
    drivers.push({ text: "Center-suspected DME present", weight: 7, domain: "ocular" });
  } else if (dmeOD === "non_center" || dmeOS === "non_center") {
    drivers.push({ text: "Non-center DME present", weight: 4, domain: "ocular" });
  }

  if ((e.centerInvolvingOD || e.centerInvolvingOS) && macularScore >= 6) {
    drivers.push({ text: "Center-involving macular disease", weight: 9, domain: "ocular" });
  }

  const hba1c = parseNumber(e.hba1cValue || e.hba1c);
  if (hba1c !== null && hba1c >= 10) {
    drivers.push({ text: "HbA1c markedly elevated", weight: 8, domain: "systemic" });
  } else if (hba1c !== null && hba1c >= 9) {
    drivers.push({ text: "HbA1c significantly elevated", weight: 6, domain: "systemic" });
  }

  const egfr = parseNumber(e.egfr);
  if (
    (e.acrStatus === "microalbuminuria" || e.acrStatus === "macroalbuminuria") &&
    egfr !== null &&
    egfr < 60
  ) {
    drivers.push({ text: "Albuminuria with reduced eGFR", weight: 8, domain: "systemic" });
  } else if (e.acrStatus === "microalbuminuria" || e.acrStatus === "macroalbuminuria") {
    drivers.push({ text: "Albuminuria present", weight: 5, domain: "systemic" });
  } else if (egfr !== null && egfr < 60) {
    drivers.push({ text: "Reduced eGFR present", weight: 5, domain: "systemic" });
  }

  const systolic = parseNumber(e.systolicBP);
  const diastolic = parseNumber(e.diastolicBP);
  if ((systolic !== null && systolic >= 160) || (diastolic !== null && diastolic >= 90)) {
    drivers.push({ text: "Blood pressure significantly elevated", weight: 5, domain: "systemic" });
  }

  if (e.smokerStatus === "current") {
    drivers.push({ text: "Current smoker", weight: 3, domain: "systemic" });
  }

  if (e.pregnancyStatus === "yes" && retinopathyScore > 0) {
    drivers.push({ text: "Pregnancy with diabetic retinal disease", weight: 8, domain: "systemic" });
  }

  if (e.overdueCategory === "overdue_ge_6m") {
    drivers.push({ text: "Follow-up delayed by 6 months or more", weight: 7, domain: "safety" });
  } else if (e.overdueCategory === "overdue_lt_6m") {
    drivers.push({ text: "Follow-up delay present", weight: 4, domain: "safety" });
  }

  if (e.missedFollowupCategory === "repeated") {
    drivers.push({ text: "Repeated missed follow-up", weight: 7, domain: "safety" });
  } else if (e.missedFollowupCategory === "one") {
    drivers.push({ text: "Missed follow-up recorded", weight: 4, domain: "safety" });
  }

  if (e.octMissingWhenIndicated) {
    drivers.push({ text: "OCT missing when clinically indicated", weight: 6, domain: "safety" });
  }

  if (e.ungradableFlagOD || e.ungradableFlagOS) {
    drivers.push({ text: "Ungradable imaging / unsafe to defer", weight: 9, domain: "safety" });
  }

  if (e.careReliabilityCategory === "major_concern") {
    drivers.push({ text: "Major care reliability concern", weight: 6, domain: "safety" });
  } else if (e.careReliabilityCategory === "concern") {
    drivers.push({ text: "Care reliability concern", weight: 3, domain: "safety" });
  }

  drivers.sort((a, b) => b.weight - a.weight);

  const overallTop = drivers.slice(0, 3);
  const topOcular = drivers.find((d) => d.domain === "ocular")?.text || "";
  const topSystemic = drivers.find((d) => d.domain === "systemic")?.text || "";
  const topSafety = drivers.find((d) => d.domain === "safety")?.text || "";

  return {
    topDriver1: overallTop[0]?.text || "",
    topDriver2: overallTop[1]?.text || "",
    topDriver3: overallTop[2]?.text || "",
    topOcularDriver: topOcular,
    topSystemicDriver: topSystemic,
    topSafetyDriver: topSafety,
  };
}

function finalScoreCalc(e: Encounter) {
  const retOD = eyeRetinopathyScore("OD", e);
  const retOS = eyeRetinopathyScore("OS", e);
  const macOD = eyeMacularScore("OD", e);
  const macOS = eyeMacularScore("OS", e);

  const retinopathyScore = Math.max(retOD, retOS);
  const macularScore = Math.max(macOD, macOS);
  const systemicScore = systemicScoreCalc(e);
  const safetyReliabilityScore = safetyReliabilityScoreCalc(e);

  const ocularScore = retinopathyScore + macularScore;
  const reliabilityScore = safetyReliabilityScore;
  const totalScore = retinopathyScore + macularScore + systemicScore + safetyReliabilityScore;

  const hasUrgentRedFlag =
    !!e.redFlagVHOD ||
    !!e.redFlagVHOS ||
    !!e.redFlagTractionOD ||
    !!e.redFlagTractionOS ||
    !!e.vhOD ||
    !!e.vhOS ||
    !!e.tractionOD ||
    !!e.tractionOS ||
    (normalizeDrGrade(e.drSeverityOD) === "pdr" &&
      (!!e.activeNVDOD || !!e.activeNVEOD || !!e.redFlagNVDOD || !!e.redFlagNVEOD)) ||
    (normalizeDrGrade(e.drSeverityOS) === "pdr" &&
      (!!e.activeNVDOS || !!e.activeNVEOS || !!e.redFlagNVDOS || !!e.redFlagNVEOS)) ||
    !!e.redFlagRapidDropOD ||
    !!e.redFlagRapidDropOS ||
    !!e.rapidDropVisitOD ||
    !!e.rapidDropVisitOS ||
    ((e.centerInvolvingOD || e.centerInvolvingOS) &&
      (e.bcvaBucketOD === "worse_than_20_200" || e.bcvaBucketOS === "worse_than_20_200"));

  let finalColor: FinalColor = "Green";
  let overrideApplied = false;
  let overrideReason = "";

  if (hasUrgentRedFlag) {
    finalColor = "Red";
    overrideApplied = true;
    overrideReason = "Urgent retinal red-flag finding present";
  } else {
    if (totalScore <= 5) finalColor = "Green";
    else if (totalScore <= 11) finalColor = "Yellow";
    else if (totalScore <= 18) finalColor = "Orange";
    else finalColor = "Red";

    if (retinopathyScore >= 12) finalColor = "Red";
    else if ((retinopathyScore >= 8 || macularScore >= 7) && (finalColor === "Green" || finalColor === "Yellow")) {
      finalColor = "Orange";
    }

    if (safetyReliabilityScore >= 6) {
      if (finalColor === "Green") finalColor = "Yellow";
      else if (finalColor === "Yellow") finalColor = "Orange";
      else if (finalColor === "Orange") finalColor = "Red";
    }

    const anyDr =
      ["mild_npdr", "moderate_npdr", "severe_npdr", "pdr"].includes(normalizeDrGrade(e.drSeverityOD)) ||
      ["mild_npdr", "moderate_npdr", "severe_npdr", "pdr"].includes(normalizeDrGrade(e.drSeverityOS));

    if (e.pregnancyStatus === "yes" && anyDr && (finalColor === "Green" || finalColor === "Yellow")) {
      finalColor = "Orange";
    }

    if (e.ungradableFlagOD || e.ungradableFlagOS) {
      if (finalColor === "Green") finalColor = "Yellow";
    }
  }

  let followUp = "12 months";
  let urgency = "Routine";
  let suggestedAction = "Continue regular diabetic eye screening.";

  if (finalColor === "Yellow") {
    followUp = "6–12 months";
    urgency = "Early review";
    suggestedAction = "Closer review and optimize diabetic/systemic control.";
  } else if (finalColor === "Orange") {
    followUp = "1–3 months";
    urgency = "Retina-directed review";
    suggestedAction = "Arrange retina review and complete indicated imaging.";
  } else if (finalColor === "Red") {
    followUp = "Urgent / same week";
    urgency = "Urgent";
    suggestedAction = "Urgent retina pathway required.";
  }

  const essentialFieldsPresent =
    !!normalizeDrGrade(e.drSeverityOD) &&
    !!normalizeDrGrade(e.drSeverityOS) &&
    !!normalizeDme(e.dmeOD) &&
    !!normalizeDme(e.dmeOS) &&
    !!e.bcvaBucketOD &&
    !!e.bcvaBucketOS &&
    !!e.diabetesDurationYears &&
    !!(e.hba1cValue || e.hba1c) &&
    !!e.systolicBP &&
    !!e.diastolicBP &&
    !!e.egfr &&
    !!e.overdueCategory &&
    !!e.missedFollowupCategory;

  const confidenceGrade = essentialFieldsPresent ? "High" : "Limited";
  const riskBandV2 =
    finalColor === "Green"
      ? "Low"
      : finalColor === "Yellow"
      ? "Moderate"
      : finalColor === "Orange"
      ? "High"
      : "Very High";

  const drivers = buildDrivers(e, retinopathyScore, macularScore);

  return {
    retinopathyScore,
    macularScore,
    systemicScore,
    safetyReliabilityScore,
    ocularScore,
    reliabilityScore,
    totalScore,
    finalColor,
    riskBand: finalColor,
    riskBandV2,
    urgency,
    followUp,
    suggestedAction,
    confidenceGrade,
    overrideApplied,
    overrideReason,
    ...drivers,
  };
}

function summaryLine(label: string, value?: string | number | boolean | null) {
  const display =
    value === undefined || value === null || value === "" ? "--" : String(value);
  return (
    <div style={summaryLineStyle}>
      <strong style={{ color: "#0f172a" }}>{label}:</strong>{" "}
      <span style={{ color: "#334155" }}>{display}</span>
    </div>
  );
}

export default function EncounterWorkspacePage() {
  const { encounterId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<"summary" | "systemic" | "eyes" | "reliability" | "score">("summary");
  const [encounter, setEncounter] = useState<Encounter | null>(null);

  useEffect(() => {
    const found = loadEncounters().find((e) => e.encounterId === encounterId) || null;

    if (!found) {
      setEncounter(null);
      return;
    }

    const hydrated = {
      ...found,
      ...finalScoreCalc(found),
    };

    setEncounter(hydrated);
  }, [encounterId]);

  const updateField = <K extends keyof Encounter>(key: K, value: Encounter[K]) => {
    setEncounter((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const persistEncounter = (nextStatus?: EncounterStatus) => {
    if (!encounter) return;

    const derived = finalScoreCalc(encounter);

    const updatedEncounter: Encounter = {
      ...encounter,
      ...derived,
      status: nextStatus || encounter.status,
      lastSavedAt: new Date().toLocaleString(),
    };

    const all = loadEncounters();
    const updatedAll = all.map((e) =>
      e.encounterId === encounter.encounterId ? updatedEncounter : e
    );

    saveEncounters(updatedAll);
    setEncounter(updatedEncounter);
    alert(`Encounter ${(nextStatus || encounter.status).toLowerCase()} successfully.`);
  };

  const handleRunScore = () => {
    if (!encounter) return;

    const result = finalScoreCalc(encounter);

    const updatedEncounter: Encounter = {
      ...encounter,
      ...result,
      status: "Saved",
      lastSavedAt: new Date().toLocaleString(),
    };

    const all = loadEncounters();
    const updatedAll = all.map((e) =>
      e.encounterId === encounter.encounterId ? updatedEncounter : e
    );

    saveEncounters(updatedAll);
    setEncounter(updatedEncounter);
    alert("DRMET V2 score calculated and saved.");
  };

  if (!encounter) {
    return (
      <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        <nav style={{ marginBottom: "24px", display: "flex", gap: "16px" }}>
          <Link to="/">Dashboard</Link>
          <Link to="/patients">Patients</Link>
          <Link to="/encounters/queue">Encounter Queue</Link>
        </nav>
        <h1>Encounter not found</h1>
        <p>Please return to Patients and create or select an encounter again.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <nav style={{ marginBottom: "24px", display: "flex", gap: "16px" }}>
        <Link to="/">Dashboard</Link>
        <Link to="/patients">Patients</Link>
        <Link to="/encounters/queue">Encounter Queue</Link>
      </nav>

      <div style={headerBoxStyle}>
        <div style={headerItemStyle}><strong>Patient ID:</strong> {encounter.patientId || "--"}</div>
        <div style={headerItemStyle}><strong>Display ID:</strong> {encounter.displayId || "--"}</div>
        <div style={headerItemStyle}><strong>Name:</strong> {encounter.firstName} {encounter.lastName}</div>
        <div style={headerItemStyle}><strong>MRN:</strong> {encounter.mrn || "--"}</div>
        <div style={headerItemStyle}><strong>Status:</strong> {encounter.status}</div>
        <div style={headerItemStyle}><strong>Last saved:</strong> {encounter.lastSavedAt || "--"}</div>
      </div>

      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>Encounter Workspace</h1>
      <p style={{ fontSize: "18px", color: "#475569", marginBottom: "24px" }}>
        Review and complete the encounter workflow.
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button style={tabButtonStyle(activeTab === "summary")} onClick={() => setActiveTab("summary")}>Summary</button>
        <button style={tabButtonStyle(activeTab === "systemic")} onClick={() => setActiveTab("systemic")}>Systemic</button>
        <button style={tabButtonStyle(activeTab === "eyes")} onClick={() => setActiveTab("eyes")}>Eyes</button>
        <button style={tabButtonStyle(activeTab === "reliability")} onClick={() => setActiveTab("reliability")}>Reliability</button>
        <button style={tabButtonStyle(activeTab === "score")} onClick={() => setActiveTab("score")}>Score</button>
      </div>

      {activeTab === "summary" && (
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Encounter Summary</h2>

          <div style={gaugesGridStyle}>
            <GaugeCard
              title="Retinopathy Severity"
              score={encounter.retinopathyScore}
              max={20}
              driver={encounter.topOcularDriver || encounter.topDriver1}
            />
            <GaugeCard
              title="Macular / DME"
              score={encounter.macularScore}
              max={14}
              driver={encounter.topDriver2 || encounter.topOcularDriver}
            />
            <GaugeCard
              title="Systemic"
              score={encounter.systemicScore}
              max={12}
              driver={encounter.topSystemicDriver}
            />
            <GaugeCard
              title="Safety / Reliability"
              score={encounter.safetyReliabilityScore}
              max={10}
              driver={encounter.topSafetyDriver}
            />
          </div>

          <div style={summaryGridStyle}>
            <div style={summaryCardStyle}>
              <h3 style={summarySectionTitleStyle}>Visit Snapshot</h3>
              {summaryLine("Encounter ID", encounter.encounterId)}
              {summaryLine("Encounter Type", encounter.encounterType)}
              {summaryLine("Encounter Date/Time", encounter.encounterDateTime)}
              {summaryLine("Chief Complaint", encounter.chiefComplaint)}
              {summaryLine("Symptoms Present", encounter.symptomsPresent ? "Yes" : "No")}
            </div>

            <div style={summaryCardStyle}>
              <h3 style={summarySectionTitleStyle}>Visual & Pressure</h3>
              {summaryLine("VA OD", encounter.visualAcuityOD)}
              {summaryLine("VA OS", encounter.visualAcuityOS)}
              {summaryLine("IOP OD", encounter.iopOD)}
              {summaryLine("IOP OS", encounter.iopOS)}
              {summaryLine("Status", encounter.status)}
            </div>

            <div style={summaryCardStyle}>
              <h3 style={summarySectionTitleStyle}>Retina Snapshot</h3>
              {summaryLine("DR OD", encounter.drSeverityOD)}
              {summaryLine("DR OS", encounter.drSeverityOS)}
              {summaryLine("DME OD", encounter.dmeOD)}
              {summaryLine("DME OS", encounter.dmeOS)}
              {summaryLine("BCVA Bucket OD", encounter.bcvaBucketOD)}
              {summaryLine("BCVA Bucket OS", encounter.bcvaBucketOS)}
            </div>

            <div style={summaryCardStyle}>
              <h3 style={summarySectionTitleStyle}>Systemic Snapshot</h3>
              {summaryLine("Diabetes Duration (years)", encounter.diabetesDurationYears)}
              {summaryLine("HbA1c", encounter.hba1cValue || encounter.hba1c)}
              {summaryLine("Blood Pressure", encounter.bp || `${encounter.systolicBP || "--"}/${encounter.diastolicBP || "--"}`)}
              {summaryLine("eGFR", encounter.egfr)}
              {summaryLine("BMI", encounter.bmi)}
              {summaryLine("Smoker Status", encounter.smokerStatus)}
            </div>

            <div style={summaryCardStyle}>
              <h3 style={summarySectionTitleStyle}>Reliability Snapshot</h3>
              {summaryLine("Overdue Category", encounter.overdueCategory)}
              {summaryLine("Missed Follow-up", encounter.missedFollowupCategory)}
              {summaryLine("OCT Missing When Indicated", encounter.octMissingWhenIndicated ? "Yes" : "No")}
              {summaryLine("Care Reliability", encounter.careReliabilityCategory)}
            </div>

            <div style={summaryCardStyle}>
              <h3 style={summarySectionTitleStyle}>Decision Snapshot</h3>
              {summaryLine("Retinopathy Score", encounter.retinopathyScore)}
              {summaryLine("Macular Score", encounter.macularScore)}
              {summaryLine("Systemic Score", encounter.systemicScore)}
              {summaryLine("Safety/Reliability Score", encounter.safetyReliabilityScore)}
              {summaryLine("Total Score", encounter.totalScore)}
              {summaryLine("Final Color", encounter.finalColor || encounter.riskBand)}
              {summaryLine("V2 Risk Band", encounter.riskBandV2)}
              {summaryLine("Urgency", encounter.urgency)}
              {summaryLine("Follow-up", encounter.followUp)}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <TopDriversCard
              topDriver1={encounter.topDriver1}
              topDriver2={encounter.topDriver2}
              topDriver3={encounter.topDriver3}
              topOcularDriver={encounter.topOcularDriver}
              topSystemicDriver={encounter.topSystemicDriver}
              topSafetyDriver={encounter.topSafetyDriver}
            />
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={buttonPrimaryStyle} onClick={() => persistEncounter("Saved")}>
              Save Encounter
            </button>
            <button style={buttonSecondaryStyle} onClick={() => persistEncounter("Completed")}>
              Complete Encounter
            </button>
            <Link
              to={`/encounters/${encodeURIComponent(encounter.encounterId)}/reports`}
              style={linkButtonStyle}
            >
              Reports
            </Link>
          </div>
        </div>
      )}

      {activeTab === "systemic" && (
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Systemic Profile</h2>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>Diabetes Duration (years)</label>
              <select
                value={encounter.diabetesDurationYears || "5"}
                onChange={(e) => updateField("diabetesDurationYears", e.target.value)}
                style={inputStyle}
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>HbA1c</label>
              <input
                type="text"
                value={encounter.hba1cValue || encounter.hba1c || ""}
                onChange={(e) => {
                  updateField("hba1cValue", e.target.value);
                  updateField("hba1c", e.target.value);
                }}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>HbA1c Date</label>
              <input
                type="date"
                value={encounter.hba1cDate || ""}
                onChange={(e) => updateField("hba1cDate", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>eGFR</label>
              <select
                value={encounter.egfr || "100"}
                onChange={(e) => updateField("egfr", e.target.value)}
                style={inputStyle}
              >
                {EGFR_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>Systolic BP</label>
              <select
                value={encounter.systolicBP || "130"}
                onChange={(e) => {
                  const next = e.target.value;
                  updateField("systolicBP", next);
                  updateField("bp", `${next || ""}/${encounter.diastolicBP || "80"}`);
                }}
                style={inputStyle}
              >
                {SYSTOLIC_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Diastolic BP</label>
              <select
                value={encounter.diastolicBP || "80"}
                onChange={(e) => {
                  const next = e.target.value;
                  updateField("diastolicBP", next);
                  updateField("bp", `${encounter.systolicBP || "130"}/${next}`);
                }}
                style={inputStyle}
              >
                {DIASTOLIC_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>ACR / Albuminuria</label>
              <select
                value={encounter.acrStatus || ""}
                onChange={(e) => updateField("acrStatus", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="normal">Normal</option>
                <option value="microalbuminuria">Microalbuminuria</option>
                <option value="macroalbuminuria">Macroalbuminuria</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Lipid Status</label>
              <select
                value={encounter.lipidStatus || ""}
                onChange={(e) => updateField("lipidStatus", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="at_target">At target</option>
                <option value="not_at_target">Not at target</option>
              </select>
            </div>
          </div>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>BMI</label>
              <select
                value={encounter.bmi || "22"}
                onChange={(e) => updateField("bmi", e.target.value)}
                style={inputStyle}
              >
                {BMI_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Smoker Status</label>
              <select
                value={encounter.smokerStatus || ""}
                onChange={(e) => updateField("smokerStatus", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="never">Never</option>
                <option value="former">Former</option>
                <option value="current">Current</option>
              </select>
            </div>
          </div>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>Pregnancy Status</label>
              <select
                value={encounter.pregnancyStatus || ""}
                onChange={(e) => updateField("pregnancyStatus", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="not_applicable">Not applicable</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <label style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={!!encounter.endOrganDamageFlag}
                  onChange={(e) => updateField("endOrganDamageFlag", e.target.checked)}
                />
                <span>End-organ damage present</span>
              </label>
            </div>
          </div>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>Legacy Renal Status</label>
              <select
                value={encounter.renalStatus || "None"}
                onChange={(e) => updateField("renalStatus", e.target.value)}
                style={inputStyle}
              >
                <option>None</option>
                <option>Microalbuminuria</option>
                <option>CKD / Reduced eGFR</option>
                <option>Both Albuminuria and CKD</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button style={buttonPrimaryStyle} onClick={() => persistEncounter("Saved")}>
              Save Systemic Data
            </button>
          </div>
        </div>
      )}

      {activeTab === "eyes" && (
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Ocular Profile</h2>

          <div style={eyeBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Right Eye (OD)</h3>

            <label style={labelStyle}>DR Severity OD</label>
            <select
              value={encounter.drSeverityOD || "No DR"}
              onChange={(e) => updateField("drSeverityOD", e.target.value)}
              style={inputStyle}
            >
              <option>No DR</option>
              <option>Mild NPDR</option>
              <option>Moderate NPDR</option>
              <option>Severe NPDR</option>
              <option>PDR</option>
            </select>

            <label style={labelStyle}>DME OD</label>
            <select
              value={encounter.dmeOD || "No DME"}
              onChange={(e) => updateField("dmeOD", e.target.value)}
              style={inputStyle}
            >
              <option>No DME</option>
              <option>Non-center</option>
              <option>Center-suspected</option>
              <option>Center-confirmed</option>
            </select>

            <label style={labelStyle}>BCVA Bucket OD</label>
            <select
              value={encounter.bcvaBucketOD || ""}
              onChange={(e) => updateField("bcvaBucketOD", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select</option>
              <option value="20_25_or_better">20/25 or better</option>
              <option value="20_30_to_20_40">20/30–20/40</option>
              <option value="20_50_to_20_80">20/50–20/80</option>
              <option value="20_100_to_20_200">20/100–20/200</option>
              <option value="worse_than_20_200">Worse than 20/200</option>
            </select>

            <div style={checkboxGridStyle}>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.octAvailableOD} onChange={(e) => updateField("octAvailableOD", e.target.checked)} />
                <span>OCT available OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.priorAntiVegfOD} onChange={(e) => updateField("priorAntiVegfOD", e.target.checked)} />
                <span>Prior anti-VEGF OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.priorPrpOD} onChange={(e) => updateField("priorPrpOD", e.target.checked)} />
                <span>Prior PRP OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.priorVitrectomyOD} onChange={(e) => updateField("priorVitrectomyOD", e.target.checked)} />
                <span>Prior vitrectomy OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagVHOD} onChange={(e) => updateField("redFlagVHOD", e.target.checked)} />
                <span>Vitreous hemorrhage OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagNVDOD} onChange={(e) => updateField("redFlagNVDOD", e.target.checked)} />
                <span>Active NVD OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagNVEOD} onChange={(e) => updateField("redFlagNVEOD", e.target.checked)} />
                <span>Active NVE OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagTractionOD} onChange={(e) => updateField("redFlagTractionOD", e.target.checked)} />
                <span>Traction concern OD</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagRapidDropOD} onChange={(e) => updateField("redFlagRapidDropOD", e.target.checked)} />
                <span>Rapid visual drop OD</span>
              </label>
            </div>
          </div>

          <div style={eyeBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Left Eye (OS)</h3>

            <label style={labelStyle}>DR Severity OS</label>
            <select
              value={encounter.drSeverityOS || "No DR"}
              onChange={(e) => updateField("drSeverityOS", e.target.value)}
              style={inputStyle}
            >
              <option>No DR</option>
              <option>Mild NPDR</option>
              <option>Moderate NPDR</option>
              <option>Severe NPDR</option>
              <option>PDR</option>
            </select>

            <label style={labelStyle}>DME OS</label>
            <select
              value={encounter.dmeOS || "No DME"}
              onChange={(e) => updateField("dmeOS", e.target.value)}
              style={inputStyle}
            >
              <option>No DME</option>
              <option>Non-center</option>
              <option>Center-suspected</option>
              <option>Center-confirmed</option>
            </select>

            <label style={labelStyle}>BCVA Bucket OS</label>
            <select
              value={encounter.bcvaBucketOS || ""}
              onChange={(e) => updateField("bcvaBucketOS", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select</option>
              <option value="20_25_or_better">20/25 or better</option>
              <option value="20_30_to_20_40">20/30–20/40</option>
              <option value="20_50_to_20_80">20/50–20/80</option>
              <option value="20_100_to_20_200">20/100–20/200</option>
              <option value="worse_than_20_200">Worse than 20/200</option>
            </select>

            <div style={checkboxGridStyle}>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.octAvailableOS} onChange={(e) => updateField("octAvailableOS", e.target.checked)} />
                <span>OCT available OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.priorAntiVegfOS} onChange={(e) => updateField("priorAntiVegfOS", e.target.checked)} />
                <span>Prior anti-VEGF OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.priorPrpOS} onChange={(e) => updateField("priorPrpOS", e.target.checked)} />
                <span>Prior PRP OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.priorVitrectomyOS} onChange={(e) => updateField("priorVitrectomyOS", e.target.checked)} />
                <span>Prior vitrectomy OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagVHOS} onChange={(e) => updateField("redFlagVHOS", e.target.checked)} />
                <span>Vitreous hemorrhage OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagNVDOS} onChange={(e) => updateField("redFlagNVDOS", e.target.checked)} />
                <span>Active NVD OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagNVEOS} onChange={(e) => updateField("redFlagNVEOS", e.target.checked)} />
                <span>Active NVE OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagTractionOS} onChange={(e) => updateField("redFlagTractionOS", e.target.checked)} />
                <span>Traction concern OS</span>
              </label>
              <label style={checkboxRowStyle}>
                <input type="checkbox" checked={!!encounter.redFlagRapidDropOS} onChange={(e) => updateField("redFlagRapidDropOS", e.target.checked)} />
                <span>Rapid visual drop OS</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button style={buttonPrimaryStyle} onClick={() => persistEncounter("Saved")}>
              Save Ocular Data
            </button>
          </div>
        </div>
      )}

      {activeTab === "reliability" && (
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>Follow-up Reliability</h2>

          <div style={twoColumnStyle}>
            <div>
              <label style={labelStyle}>Overdue Category</label>
              <select
                value={encounter.overdueCategory || ""}
                onChange={(e) => updateField("overdueCategory", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="in_interval">In interval</option>
                <option value="overdue_lt_6m">Overdue &lt; 6 months</option>
                <option value="overdue_ge_6m">Overdue ≥ 6 months</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Missed Follow-up</label>
              <select
                value={encounter.missedFollowupCategory || ""}
                onChange={(e) => updateField("missedFollowupCategory", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="one">One missed follow-up</option>
                <option value="repeated">Repeated / interrupted</option>
              </select>
            </div>
          </div>

          <div style={twoColumnStyle}>
            <div>
              <label style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={!!encounter.octMissingWhenIndicated}
                  onChange={(e) => updateField("octMissingWhenIndicated", e.target.checked)}
                />
                <span>OCT missing when indicated</span>
              </label>
            </div>

            <div>
              <label style={labelStyle}>Care Reliability</label>
              <select
                value={encounter.careReliabilityCategory || ""}
                onChange={(e) => updateField("careReliabilityCategory", e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="good">Good</option>
                <option value="concern">Concern</option>
                <option value="major_concern">Major concern</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button style={buttonPrimaryStyle} onClick={() => persistEncounter("Saved")}>
              Save Reliability Data
            </button>
          </div>
        </div>
      )}

      {activeTab === "score" && (
        <div style={panelStyle}>
          <h2 style={sectionTitleStyle}>DRMET V2 Score</h2>

          <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={buttonPrimaryStyle} onClick={handleRunScore}>
              Run DRMET V2 Score
            </button>

            <Link
              to={`/encounters/${encodeURIComponent(encounter.encounterId)}/reports`}
              style={linkButtonStyle}
            >
              Reports
            </Link>
          </div>

          <div
            style={{
              marginBottom: "20px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            <RiskBar
              color={encounter.finalColor || encounter.riskBand}
              title="Patient Risk Position"
              subtitle="This strip shows where the patient currently sits between lower-risk Green and higher-risk Red."
            />
          </div>

          <div style={scoreGridStyle}>
            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Retinopathy</div>
              <div style={scoreValueStyle}>{encounter.retinopathyScore ?? "--"}</div>
            </div>

            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Macular</div>
              <div style={scoreValueStyle}>{encounter.macularScore ?? "--"}</div>
            </div>

            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Systemic</div>
              <div style={scoreValueStyle}>{encounter.systemicScore ?? "--"}</div>
            </div>

            <div style={scoreCardStyle}>
              <div style={scoreLabelStyle}>Safety/Reliability</div>
              <div style={scoreValueStyle}>{encounter.safetyReliabilityScore ?? "--"}</div>
            </div>
          </div>

          <div style={{ ...panelStyle, marginTop: "20px", padding: "20px" }}>
            <p><strong>Total Score:</strong> {encounter.totalScore ?? "--"}</p>
            <p><strong>Final Color:</strong> {encounter.finalColor || encounter.riskBand || "--"}</p>
            <p><strong>V2 Risk Band:</strong> {encounter.riskBandV2 || "--"}</p>
            <p><strong>Urgency:</strong> {encounter.urgency || "--"}</p>
            <p><strong>Follow-up:</strong> {encounter.followUp || "--"}</p>
            <p><strong>Suggested Action:</strong> {encounter.suggestedAction || "--"}</p>
            <p><strong>Confidence:</strong> {encounter.confidenceGrade || "--"}</p>
            <p><strong>Override Applied:</strong> {encounter.overrideApplied ? "Yes" : "No"}</p>

            {encounter.overrideApplied && (
              <p><strong>Override Reason:</strong> {encounter.overrideReason}</p>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <TopDriversCard
              topDriver1={encounter.topDriver1}
              topDriver2={encounter.topDriver2}
              topDriver3={encounter.topDriver3}
              topOcularDriver={encounter.topOcularDriver}
              topSystemicDriver={encounter.topSystemicDriver}
              topSafetyDriver={encounter.topSafetyDriver}
            />
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button style={buttonPrimaryStyle} onClick={() => persistEncounter("Saved")}>
              Save Scored Encounter
            </button>

            <button style={buttonSecondaryStyle} onClick={() => persistEncounter("Completed")}>
              Complete Encounter
            </button>

            <Link
              to={`/encounters/${encodeURIComponent(encounter.encounterId)}/reports`}
              style={linkButtonStyle}
            >
              Reports
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const headerBoxStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "12px",
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "24px",
  color: "#0f172a",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const headerItemStyle: React.CSSProperties = {
  color: "#0f172a",
  fontWeight: 600,
  fontSize: "15px",
};

const panelStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  color: "#0f172a",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  marginTop: 0,
  marginBottom: "20px",
  color: "#0f172a",
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "18px",
  marginTop: "20px",
};

const summaryCardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #dbe3ee",
  borderRadius: "16px",
  padding: "16px",
  color: "#334155",
};

const summaryLineStyle: React.CSSProperties = {
  marginBottom: "8px",
  fontSize: "15px",
  lineHeight: 1.45,
};

const gaugesGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
};

const summarySectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "12px",
  fontSize: "18px",
  fontWeight: 800,
  color: "#0f172a",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  marginTop: "6px",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  color: "#334155",
  marginBottom: "4px",
};

const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 16px",
  borderRadius: "999px",
  border: active ? "1px solid #2563eb" : "1px solid #cbd5e1",
  background: active ? "#dbeafe" : "white",
  color: active ? "#1d4ed8" : "#0f172a",
  fontWeight: 600,
  cursor: "pointer",
});

const buttonPrimaryStyle: React.CSSProperties = {
  background: "#2563eb",
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

const twoColumnStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "16px",
};

const eyeBoxStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "20px",
  background: "#f8fafc",
};

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "15px",
  color: "#0f172a",
};

const checkboxGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "16px",
};

const scoreGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
};

const scoreCardStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "18px",
};

const scoreLabelStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#64748b",
  marginBottom: "8px",
};

const scoreValueStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  color: "#0f172a",
};