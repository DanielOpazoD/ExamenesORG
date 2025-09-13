
export interface PatientInfo {
  nombre: string;
  id: string;
  fechaNacimiento: string;
}

export interface TestResultRaw {
  seccion: string;
  examen: string;
  resultado: string;
  unidades: string;
  rangoReferencia: string;
}

export interface GeminiResponse {
  patientInfo: PatientInfo;
  results: TestResultRaw[];
  reportDate: string; 
}

export interface ProcessedLabData {
  patientInfo: PatientInfo;
  reports: GeminiResponse[];
}

export interface TestResultProcessed {
  date: string;
  section: string;
  name: string;
  value: string;
  units: string;
  referenceRange: string;
}

export interface GroupedResultRow {
  label: string;
  values: { [date: string]: string };
  isSingleTest: boolean;
  originalTests: string[];
}

export interface ChartData {
    name: string;
    data: { date: string; value: number }[];
    range: string;
}
