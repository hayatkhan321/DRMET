export type EncounterStatus = "Draft" | "Saved" | "Completed";
export type FinalColor = "Green" | "Yellow" | "Orange" | "Red";

export type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  mrn: string;
  diabetesType: string;
  patientId: string;
  displayId: string;
  originCountryCode: string;
  originCityCode: string;
  originCountryName: string;
  originCityName: string;

  // enhancement fields
  dateOfBirth?: string;
  sex?: "Male" | "Female" | "Other" | "Unknown";
  createdAt?: string;
  updatedAt?: string;
};

export type Encounter = {
  encounterId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  mrn: string;
  displayId: string;
  encounterType: string;
  encounterDateTime: string;
  chiefComplaint: string;
  symptomsPresent: boolean;
  visualAcuityOD: string;
  visualAcuityOS: string;
  iopOD: string;
  iopOS: string;
  status: EncounterStatus;
  lastSavedAt?: string;

  // legacy fields already used in the app
  hba1c?: string;
  bp?: string;
  renalStatus?: string;
  drSeverityOD?: string;
  drSeverityOS?: string;
  dmeOD?: string;
  dmeOS?: string;
  totalScore?: number;
  riskBand?: string;
  urgency?: string;
  followUp?: string;
  suggestedAction?: string;

  // DRMET systemic
  diabetesDurationYears?: string;
  hba1cValue?: string;
  hba1cDate?: string;
  systolicBP?: string;
  diastolicBP?: string;
  egfr?: string;
  acrStatus?: string;
  lipidStatus?: string;
  bmi?: string;
  smokerStatus?: string;
  pregnancyStatus?: string;
  endOrganDamageFlag?: boolean;

  // DRMET ocular OD
  bcvaBucketOD?: string;
  octAvailableOD?: boolean;
  priorAntiVegfOD?: boolean;
  priorPrpOD?: boolean;
  priorVitrectomyOD?: boolean;
  redFlagVHOD?: boolean;
  redFlagNVDOD?: boolean;
  redFlagNVEOD?: boolean;
  redFlagTractionOD?: boolean;
  redFlagRapidDropOD?: boolean;

  // DRMET ocular OS
  bcvaBucketOS?: string;
  octAvailableOS?: boolean;
  priorAntiVegfOS?: boolean;
  priorPrpOS?: boolean;
  priorVitrectomyOS?: boolean;
  redFlagVHOS?: boolean;
  redFlagNVDOS?: boolean;
  redFlagNVEOS?: boolean;
  redFlagTractionOS?: boolean;
  redFlagRapidDropOS?: boolean;

  // V2 separated retinal and macular domain fields
  activeNVDOD?: boolean;
  activeNVDOS?: boolean;
  activeNVEOD?: boolean;
  activeNVEOS?: boolean;
  vhOD?: boolean;
  vhOS?: boolean;
  tractionOD?: boolean;
  tractionOS?: boolean;
  rapidDropVisitOD?: boolean;
  rapidDropVisitOS?: boolean;

  centerInvolvingOD?: boolean;
  centerInvolvingOS?: boolean;

  // OCR / OCT-ready fields
  octVendorOD?: string;
  octVendorOS?: string;
  octScanDateOD?: string;
  octScanDateOS?: string;
  centralMacularThicknessOD?: string;
  centralMacularThicknessOS?: string;
  irfOD?: boolean;
  irfOS?: boolean;
  srfOD?: boolean;
  srfOS?: boolean;
  ocrRawTextOD?: string;
  ocrRawTextOS?: string;
  ocrConfidenceOD?: string;
  ocrConfidenceOS?: string;
  clinicianVerifiedOcrOD?: boolean;
  clinicianVerifiedOcrOS?: boolean;
  imageQualityStatusOD?: string;
  imageQualityStatusOS?: string;
  ungradableFlagOD?: boolean;
  ungradableFlagOS?: boolean;
  imageSourceTypeOD?: string;
  imageSourceTypeOS?: string;

  // DRMET reliability / safety
  overdueCategory?: string;
  missedFollowupCategory?: string;
  octMissingWhenIndicated?: boolean;
  careReliabilityCategory?: string;

  // V2 separated domain scores
  retinopathyScore?: number;
  macularScore?: number;
  systemicScore?: number;
  safetyReliabilityScore?: number;

  // backward-compatible current scores
  ocularScore?: number;
  reliabilityScore?: number;

  // V2 outputs
  totalScore?: number;
  finalColor?: FinalColor;
  confidenceGrade?: string;
  overrideApplied?: boolean;
  overrideReason?: string;
  riskBandV2?: string;

  // explainability
  topDriver1?: string;
  topDriver2?: string;
  topDriver3?: string;
  topOcularDriver?: string;
  topSystemicDriver?: string;
  topSafetyDriver?: string;
};

export type DoctorReport = {
  encounterId: string;
  patientName: string;
  patientId: string;
  displayId: string;
  mrn: string;
  encounterDateTime: string;
  encounterType: string;
  ocularScore: number | null;
  systemicScore: number | null;
  reliabilityScore: number | null;
  totalScore: number | null;
  finalColor: string;
  urgency: string;
  followUp: string;
  suggestedAction: string;
  confidenceGrade: string;
  overrideApplied: boolean;
  overrideReason: string;
  summaryLines: string[];
};

export type PatientReport = {
  encounterId: string;
  patientName: string;
  finalColor: string;
  urgency: string;
  followUp: string;
  suggestedAction: string;
  simpleSummary: string[];
};