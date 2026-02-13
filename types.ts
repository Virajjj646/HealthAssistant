
export enum TrustLevel {
  SAFE = 'Safe',
  CAUTION = 'Caution',
  UNSAFE = 'Unsafe'
}

export interface MisinfoResult {
  trustLevel: TrustLevel;
  explanation: string;
  trickUsed: string;
}

export interface SimplifiedMedicalInfo {
  whatIsIt: string;
  howToUse: string;
  whyImportant: string;
}

export interface MedicationGuide {
  name: string;
  dosage: string;
  precautions: string;
  reminder: string;
}

export type AppFeature = 'clarity' | 'misinfo' | 'meds';
