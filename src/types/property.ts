export interface ComplianceStatus {
  gasSafety: boolean;
  eicr: boolean;
  epc: boolean;
  rentersRightsAct2026: boolean;
  tenantInfoStatement: boolean;
}

export type ComplianceNA = Partial<Record<keyof ComplianceStatus, boolean>>;

export type PropertyType = "house" | "flat" | "hmo";

export interface Property {
  id: string;
  address: string;
  compliance: ComplianceStatus;
  complianceNA?: ComplianceNA;
  propertyType?: PropertyType;
  mouldCheckPassed?: boolean;
  windowRestrictorsOk?: boolean;
}

export interface VaultDocument {
  id: string;
  propertyId: string;
  name: string;
  type: "gas" | "eicr" | "epc" | "tenant-info" | "other";
  addedAt: string;
}
