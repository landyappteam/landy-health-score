import { Flame, Zap, BarChart3, Scale, FileText, Trash2, AlertTriangle, PackageOpen } from "lucide-react";
import type { Property, ComplianceStatus } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  onToggle: (propertyId: string, field: keyof ComplianceStatus) => void;
  onRemove: (propertyId: string) => void;
  onEpcOptimise: () => void;
  onGeneratePack: (propertyId: string) => void;
}

const COMPLIANCE_FIELDS = 5;

const complianceItems: { key: keyof ComplianceStatus; label: string; icon: typeof Flame; deadline?: string }[] = [
  { key: "gasSafety", label: "Gas Safety", icon: Flame },
  { key: "eicr", label: "EICR", icon: Zap },
  { key: "epc", label: "EPC", icon: BarChart3 },
  { key: "rentersRightsAct2026", label: "Renters' Rights Act 2026", icon: Scale },
  { key: "tenantInfoStatement", label: "Tenant Info Statement", icon: FileText, deadline: "31 May 2026" },
];

const PropertyCard = ({ property, onToggle, onRemove, onEpcOptimise, onGeneratePack }: PropertyCardProps) => {
  const compliantCount = Object.values(property.compliance).filter(Boolean).length;

  return (
    <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-card-foreground truncate">{property.address}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {compliantCount}/{COMPLIANCE_FIELDS} compliant
          </p>
        </div>
        <button
          onClick={() => onRemove(property.id)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove property"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {complianceItems.map(({ key, label, icon: Icon, deadline }) => {
          const isActive = property.compliance[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(property.id, key)}
              className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate text-left">
                {label}
                {deadline && !isActive && (
                  <span className="block text-[10px] opacity-70">Due: {deadline}</span>
                )}
              </span>
              {deadline && !isActive && (
                <AlertTriangle className="w-3 h-3 shrink-0 text-score-fair absolute top-1 right-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={onEpcOptimise}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-score-good" />
          EPC Optimiser
        </button>
        <button
          onClick={() => onGeneratePack(property.id)}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <PackageOpen className="w-4 h-4 text-primary" />
          Tenant Pack
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
