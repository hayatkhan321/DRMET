import type { Encounter, Patient } from "./sharedtype";

export const PATIENTS_KEY = "drmet-patients";
export const ENCOUNTERS_KEY = "drmet-encounters";

const defaultPatients: Patient[] = [
  {
    id: 1,
    firstName: "Ahmed",
    lastName: "Ali",
    mrn: "MRN-1001",
    diabetesType: "Type 2",
    patientId: "PT-000001",
    displayId: "AE-DU-PT-000001",
    originCountryCode: "AE",
    originCityCode: "DU",
    originCountryName: "United Arab Emirates",
    originCityName: "Dubai",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    firstName: "Sara",
    lastName: "Khan",
    mrn: "MRN-1002",
    diabetesType: "Type 1",
    patientId: "PT-000002",
    displayId: "AE-DU-PT-000002",
    originCountryCode: "AE",
    originCityCode: "DU",
    originCountryName: "United Arab Emirates",
    originCityName: "Dubai",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadPatients(): Patient[] {
  const raw = localStorage.getItem(PATIENTS_KEY);
  if (!raw) return defaultPatients;
  try {
    return JSON.parse(raw) as Patient[];
  } catch {
    return defaultPatients;
  }
}

export function savePatients(patients: Patient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function loadEncounters(): Encounter[] {
  const raw = localStorage.getItem(ENCOUNTERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Encounter[];
  } catch {
    return [];
  }
}

export function saveEncounters(encounters: Encounter[]) {
  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(encounters));
}

export function getLatestEncounterForPatient(patientId: string): Encounter | null {
  const encounters = loadEncounters()
    .filter((e) => e.patientId === patientId)
    .slice()
    .sort((a, b) => {
      const aDate = Date.parse(a.encounterDateTime || a.lastSavedAt || "");
      const bDate = Date.parse(b.encounterDateTime || b.lastSavedAt || "");
      return aDate - bDate;
    });

  if (encounters.length === 0) return null;
  return encounters[encounters.length - 1];
}

export function padSequence(n: number) {
  return String(n).padStart(6, "0");
}

export function buildPatient(
  firstName: string,
  lastName: string,
  mrn: string,
  diabetesType: string,
  nextNumber: number
): Patient {
  const patientId = `PT-${padSequence(nextNumber)}`;
  const displayId = `AE-DU-${patientId}`;
  const now = new Date().toISOString();

  return {
    id: Date.now(),
    firstName,
    lastName,
    mrn,
    diabetesType,
    patientId,
    displayId,
    originCountryCode: "AE",
    originCityCode: "DU",
    originCountryName: "United Arab Emirates",
    originCityName: "Dubai",
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertEncounter(nextEncounter: Encounter) {
  const existing = loadEncounters();
  const index = existing.findIndex((e) => e.encounterId === nextEncounter.encounterId);

  if (index === -1) {
    saveEncounters([...existing, nextEncounter]);
    return;
  }

  const updated = [...existing];
  updated[index] = nextEncounter;
  saveEncounters(updated);
}

export function deleteEncounter(encounterId: string) {
  const updated = loadEncounters().filter((e) => e.encounterId !== encounterId);
  saveEncounters(updated);
}

export function getEncounterById(encounterId: string): Encounter | null {
  return loadEncounters().find((e) => e.encounterId === encounterId) || null;
}

export function getPatientById(patientId: string): Patient | null {
  return loadPatients().find((p) => p.patientId === patientId) || null;
}

export function formatEncounterColor(encounter: Encounter) {
  return encounter.finalColor || encounter.riskBand || "--";
}