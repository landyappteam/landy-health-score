export interface ComplianceStatus {
  gasSafety: boolean;
  eicr: boolean;
  epc: boolean;
  rentersRightsAct2026: boolean;
}

export interface Property {
  id: string;
  address: string;
  compliance: ComplianceStatus;
}
