import { useMemo } from "react";
import { Info, AlertTriangle, ShieldAlert, Droplet, SquareArrowOutUpRight } from "lucide-react";
import type { Property } from "@/types/property";

type AlertLevel = "sage" | "amber" | "red";

interface ActionAlert {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  priority: number; // lower = higher priority
}

const DEADLINE = new Date("2026-05-31T23:59:59Z");

function generateAlerts(properties: Property[]): ActionAlert[] {
  const alerts: ActionAlert[] = [];
  const now = new Date();

  // 2026 Tenant Info Statement deadline
  if (now < DEADLINE) {
    const missing = properties.filter(
      (p) => !p.compliance.tenantInfoStatement && !p.complianceNA?.tenantInfoStatement
    );
    if (missing.length > 0) {
      alerts.push({
        id: "tenant-statement-2026",
        level: "sage",
        title: "Legal Action Required",
        message: `Issue your Tenant Info Statement before the 31 May 2026 deadline to maintain possession rights. (${missing.length} ${missing.length === 1 ? "property" : "properties"} outstanding)`,
        priority: 1,
      });
    }
  }

  // Awaab's Law — mould/damp
  const mouldFail = properties.filter((p) => p.mouldCheckPassed === false);
  if (mouldFail.length > 0) {
    alerts.push({
      id: "awaabs-law",
      level: "red",
      title: "Emergency: Awaab's Law",
      message: `Awaab's Law requires an inspection within 24 hours for reported damp or mould. (${mouldFail.length} ${mouldFail.length === 1 ? "property" : "properties"} flagged)`,
      priority: 0,
    });
  }

  // Decent Homes Standard — window restrictors
  const windowFail = properties.filter((p) => p.windowRestrictorsOk === false);
  if (windowFail.length > 0) {
    alerts.push({
      id: "decent-homes-windows",
      level: "amber",
      title: "Safety Update",
      message: `2026 Decent Homes Standard requires child-resistant window restrictors on upper floors. (${windowFail.length} ${windowFail.length === 1 ? "property" : "properties"} affected)`,
      priority: 2,
    });
  }

  // HMO-specific
  const hmos = properties.filter((p) => p.propertyType === "hmo");
  if (hmos.length > 0) {
    alerts.push({
      id: "hmo-compliance-2026",
      level: "sage",
      title: "2026 HMO Compliance",
      message: `Ensure your HMO license is displayed in a communal area and fire doors are inspected. (${hmos.length} HMO ${hmos.length === 1 ? "property" : "properties"})`,
      priority: 3,
    });
  }

  return alerts.sort((a, b) => a.priority - b.priority);
}

const levelConfig: Record<AlertLevel, { bg: string; border: string; icon: string; iconComponent: typeof Info }> = {
  red: {
    bg: "hsl(0 65% 97%)",
    border: "hsl(0 65% 88%)",
    icon: "hsl(0 65% 50%)",
    iconComponent: AlertTriangle,
  },
  amber: {
    bg: "hsl(var(--risk-warm-muted))",
    border: "hsl(var(--risk-warm) / 0.3)",
    icon: "hsl(var(--risk-warm))",
    iconComponent: ShieldAlert,
  },
  sage: {
    bg: "hsl(var(--hygge-sage) / 0.08)",
    border: "hsl(var(--hygge-sage) / 0.25)",
    icon: "hsl(var(--hygge-sage))",
    iconComponent: Info,
  },
};

interface Props {
  properties: Property[];
}

const ActionCenter = ({ properties }: Props) => {
  const alerts = useMemo(() => generateAlerts(properties), [properties]);

  if (properties.length === 0 || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Action Center
      </h3>
      {alerts.map((alert) => {
        const config = levelConfig[alert.level];
        const IconComp = config.iconComponent;
        return (
          <div
            key={alert.id}
            className="rounded-2xl border p-4 flex items-start gap-3 transition-all"
            style={{
              backgroundColor: config.bg,
              borderColor: config.border,
            }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0 mt-0.5"
              style={{ backgroundColor: `${config.icon}15` }}
            >
              <IconComp className="w-4 h-4" style={{ color: config.icon }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActionCenter;
