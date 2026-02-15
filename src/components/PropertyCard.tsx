import { Flame, Zap, BarChart3, Scale, FileText, Trash2, ClipboardList, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property, ComplianceStatus } from "@/types/property";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyCardProps {
  property: Property;
  isPro: boolean;
  onToggle: (propertyId: string, field: keyof ComplianceStatus) => void;
  onToggleNA: (propertyId: string, field: keyof ComplianceStatus) => void;
  onRemove: (propertyId: string) => void;
  onEpcOptimise: () => void;
  onGeneratePack: (propertyId: string) => void;
  onProUpsell: () => void;
}

const complianceItems: { key: keyof ComplianceStatus; label: string; icon: typeof Flame }[] = [
  { key: "gasSafety", label: "Gas Safety", icon: Flame },
  { key: "eicr", label: "EICR", icon: Zap },
  { key: "epc", label: "EPC", icon: BarChart3 },
  { key: "rentersRightsAct2026", label: "Renters' Rights", icon: Scale },
  { key: "tenantInfoStatement", label: "Tenant Info", icon: FileText },
];

const PropertyCard = ({ property, isPro, onToggle, onToggleNA, onRemove, onEpcOptimise, onGeneratePack, onProUpsell }: PropertyCardProps) => {
  const na = property.complianceNA || {};

  // Filter out N/A items entirely
  const visibleItems = complianceItems.filter(({ key }) => !na[key]);
  const compliantCount = visibleItems.filter(({ key }) => property.compliance[key]).length;
  const totalVisible = visibleItems.length;

  const handleProAction = (action: () => void) => {
    if (!isPro) {
      onProUpsell();
    } else {
      action();
    }
  };

  return (
    <div className="rounded-[12px] bg-card border border-border p-5 shadow-md flex flex-col">
      {/* Header row — bold address + compliance count inline */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <h3 className="font-serif text-lg font-bold text-card-foreground truncate tracking-tight">
            {property.address}
          </h3>
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">
            {compliantCount}/{totalVisible} compliant
          </span>
        </div>
        <button
          onClick={() => onRemove(property.id)}
          className="p-1.5 rounded-[12px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove property"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Compliance badges — N/A items hidden */}
      {totalVisible > 0 && (
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-2 mb-4">
            {visibleItems.map(({ key, label, icon: Icon }) => {
              const isComplete = property.compliance[key];
              const bgClass = isComplete ? "bg-hygge-sage" : "bg-muted";
              const iconClass = isComplete ? "text-hygge-sage-foreground" : "text-muted-foreground/50";

              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onToggle(property.id, key)}
                      className={`relative flex items-center justify-center w-9 h-9 rounded-[12px] transition-all duration-200 ${bgClass} hover:scale-110`}
                    >
                      <Icon className={`w-4 h-4 ${iconClass}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p className="font-medium">{label}</p>
                    <p className="text-muted-foreground">
                      {isComplete ? "Compliant ✓" : "Missing"}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleNA(property.id, key);
                      }}
                      className="mt-1 text-[10px] text-muted-foreground hover:text-foreground underline"
                    >
                      Mark as N/A
                    </button>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      {/* Secondary actions with Pro badges */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => handleProAction(onEpcOptimise)}
          className="relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-[12px] border border-border text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          {!isPro && <Lock className="w-3 h-3 text-muted-foreground/60 absolute top-1.5 right-1.5" />}
          <BarChart3 className="w-3.5 h-3.5 text-score-good" />
          EPC Optimiser
          {!isPro && (
            <span className="text-[9px] font-bold px-1 py-px rounded" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)", color: "hsl(var(--hygge-sage))" }}>
              PRO
            </span>
          )}
        </button>
        <button
          onClick={() => handleProAction(() => onGeneratePack(property.id))}
          className="relative flex items-center justify-center gap-1.5 px-3 py-2 rounded-[12px] border border-border text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          {!isPro && <Lock className="w-3 h-3 text-muted-foreground/60 absolute top-1.5 right-1.5" />}
          <FileText className="w-3.5 h-3.5 text-primary" />
          Tenant Pack
          {!isPro && (
            <span className="text-[9px] font-bold px-1 py-px rounded" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)", color: "hsl(var(--hygge-sage))" }}>
              PRO
            </span>
          )}
        </button>
      </div>

      {/* Induction action — full-width sage green at bottom */}
      <Link
        to={`/induction?propertyId=${property.id}&address=${encodeURIComponent(property.address)}`}
        className="flex items-center justify-center gap-2 w-full rounded-[12px] bg-hygge-sage text-hygge-sage-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <ClipboardList className="w-4 h-4" />
        Start Tenant Induction
      </Link>
    </div>
  );
};

export default PropertyCard;
