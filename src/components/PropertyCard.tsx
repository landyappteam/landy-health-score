import { Flame, Zap, BarChart3, Scale, FileText, Trash2, ClipboardList, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property, ComplianceStatus } from "@/types/property";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyCardProps {
  property: Property;
  onToggle: (propertyId: string, field: keyof ComplianceStatus) => void;
  onToggleNA: (propertyId: string, field: keyof ComplianceStatus) => void;
  onRemove: (propertyId: string) => void;
  onEpcOptimise: () => void;
  onGeneratePack: (propertyId: string) => void;
}

const complianceItems: { key: keyof ComplianceStatus; label: string; icon: typeof Flame }[] = [
  { key: "gasSafety", label: "Gas Safety", icon: Flame },
  { key: "eicr", label: "EICR", icon: Zap },
  { key: "epc", label: "EPC", icon: BarChart3 },
  { key: "rentersRightsAct2026", label: "Renters' Rights", icon: Scale },
  { key: "tenantInfoStatement", label: "Tenant Info", icon: FileText },
];

const PropertyCard = ({ property, onToggle, onToggleNA, onRemove, onEpcOptimise, onGeneratePack }: PropertyCardProps) => {
  const na = property.complianceNA || {};

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-bold text-card-foreground truncate tracking-tight">
            {property.address}
          </h3>
        </div>
        <button
          onClick={() => onRemove(property.id)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove property"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Compliance badges */}
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-2 mb-4">
          {complianceItems.map(({ key, label, icon: Icon }) => {
            const isNA = !!na[key];
            const isComplete = property.compliance[key];

            let bgClass = "bg-muted";
            let iconClass = "text-muted-foreground/50";

            if (isNA) {
              bgClass = "bg-muted/60";
              iconClass = "text-muted-foreground/40";
            } else if (isComplete) {
              bgClass = "bg-hygge-sage";
              iconClass = "text-hygge-sage-foreground";
            }

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onToggle(property.id, key)}
                    disabled={isNA}
                    className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${bgClass} ${isNA ? "cursor-default" : "hover:scale-110"}`}
                  >
                    {isNA ? (
                      <Minus className={`w-4 h-4 ${iconClass}`} />
                    ) : (
                      <Icon className={`w-4 h-4 ${iconClass}`} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">{label}</p>
                  <p className="text-muted-foreground">
                    {isNA ? "Not Applicable" : isComplete ? "Compliant ✓" : "Missing"}
                  </p>
                  {!isNA && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleNA(property.id, key);
                      }}
                      className="mt-1 text-[10px] text-muted-foreground hover:text-foreground underline"
                    >
                      Mark as N/A
                    </button>
                  )}
                  {isNA && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleNA(property.id, key);
                      }}
                      className="mt-1 text-[10px] text-muted-foreground hover:text-foreground underline"
                    >
                      Remove N/A
                    </button>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Primary action: Start Induction */}
      <Link
        to={`/induction?propertyId=${property.id}&address=${encodeURIComponent(property.address)}`}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-hygge-sage text-hygge-sage-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity mb-3"
      >
        <ClipboardList className="w-4 h-4" />
        Start Tenant Induction
      </Link>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onEpcOptimise}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <BarChart3 className="w-3.5 h-3.5 text-score-good" />
          EPC Optimiser
        </button>
        <button
          onClick={() => onGeneratePack(property.id)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-primary" />
          Tenant Pack
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
