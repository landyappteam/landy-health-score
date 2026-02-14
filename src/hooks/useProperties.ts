import { useState, useEffect, useCallback } from "react";
import type { Property, ComplianceStatus } from "@/types/property";

const STORAGE_KEY = "landy-properties";

const loadProperties = (): Property[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(loadProperties);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  const addProperty = useCallback((address: string) => {
    const newProperty: Property = {
      id: crypto.randomUUID(),
      address,
      compliance: {
        gasSafety: false,
        eicr: false,
        epc: false,
        rentersRightsAct2026: false,
      },
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

  const removeProperty = useCallback((propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
  }, []);

  const healthScore = (() => {
    if (properties.length === 0) return 0;
    const total = properties.length * 4;
    const compliant = properties.reduce((sum, p) => {
      const c = p.compliance;
      return sum + +c.gasSafety + +c.eicr + +c.epc + +c.rentersRightsAct2026;
    }, 0);
    return Math.round((compliant / total) * 100);
  })();

  return { properties, addProperty, toggleCompliance, removeProperty, healthScore };
}
