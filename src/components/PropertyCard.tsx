import { Flame, Zap, BarChart3, Scale, Trash2 } from "lucide-react";
import type { Property, ComplianceStatus } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  onToggle: (propertyId: string, field: keyof ComplianceStatus) => void;
  onRemove: (propertyId: string) => void;
}

const complianceItems: { key: keyof ComplianceStatus; label: string; icon: typeof Flame }[] = [
  { key: "gasSafety", label: "Gas Safety", icon: Flame },
  { key: "eicr", label: "EICR", icon: Zap },
  { key: "epc", label: "EPC", icon: BarChart3 },
  { key: "rentersRightsAct2026", label: "Renters' Rights Act 2026", icon: Scale },
];

const PropertyCard = ({ property, onToggle, onRemove }: PropertyCardProps) => {
  const compliantCount = Object.values(property.compliance).filter(Boolean).length;

  return (
    <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-card-foreground truncate">{property.address}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {compliantCount}/4 compliant
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
        {complianceItems.map(({ key, label, icon: Icon }) => {
          const isActive = property.compliance[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(property.id, key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate text-left">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyCard;
