import { useState, useEffect, useCallback } from "react";
import type { Property, ComplianceStatus, ComplianceNA, VaultDocument, HeatingType } from "@/types/property";

const STORAGE_KEY = "landy-properties";
const VAULT_KEY = "landy-vault";

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(() => load(STORAGE_KEY, []));
  const [documents, setDocuments] = useState<VaultDocument[]>(() => load(VAULT_KEY, []));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(VAULT_KEY, JSON.stringify(documents));
  }, [documents]);

  const addProperty = useCallback((address: string, heatingType: HeatingType = "gas") => {
    const newProperty: Property = {
      id: crypto.randomUUID(),
      address,
      heatingType,
      compliance: {
        gasSafety: false,
        eicr: false,
        epc: false,
        rentersRightsAct2026: false,
        tenantInfoStatement: false,
      },
      complianceNA: {},
    };
    setProperties((prev) => [...prev, newProperty]);
  }, []);

  const toggleCompliance = useCallback(
    (propertyId: string, field: keyof ComplianceStatus) => {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? { ...p, compliance: { ...p.compliance, [field]: !p.compliance[field] } }
            : p
        )
      );
    },
    []
  );

  const toggleNA = useCallback(
    (propertyId: string, field: keyof ComplianceStatus) => {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.id !== propertyId) return p;
          const na = p.complianceNA || {};
          const isNowNA = !na[field];
          return {
            ...p,
            complianceNA: { ...na, [field]: isNowNA },
            // If marking as N/A, clear the compliance tick
            compliance: isNowNA
              ? { ...p.compliance, [field]: false }
              : p.compliance,
          };
        })
      );
    },
    []
  );

  const removeProperty = useCallback((propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    setDocuments((prev) => prev.filter((d) => d.propertyId !== propertyId));
  }, []);

  const addDocument = useCallback((doc: Omit<VaultDocument, "id" | "addedAt">) => {
    setDocuments((prev) => [
      ...prev,
      { ...doc, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
    ]);
  }, []);

  const removeDocument = useCallback((docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, []);

  const COMPLIANCE_FIELDS = 5;

  const healthScore = (() => {
    if (properties.length === 0) return 0;
    const total = properties.length * COMPLIANCE_FIELDS;
    const compliant = properties.reduce((sum, p) => {
      const c = p.compliance;
      const na = p.complianceNA || {};
      return (
        sum +
        +(c.gasSafety || !!na.gasSafety) +
        +(c.eicr || !!na.eicr) +
        +(c.epc || !!na.epc) +
        +(c.rentersRightsAct2026 || !!na.rentersRightsAct2026) +
        +(c.tenantInfoStatement || !!na.tenantInfoStatement)
      );
    }, 0);
    return Math.round((compliant / total) * 100);
  })();

  return {
    properties,
    documents,
    addProperty,
    toggleCompliance,
    toggleNA,
    removeProperty,
    addDocument,
    removeDocument,
    healthScore,
  };
}
