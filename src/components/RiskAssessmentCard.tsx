import { Link } from "react-router-dom";
import { ShieldAlert, Lock, ArrowRight } from "lucide-react";
import type { Property } from "@/types/property";

interface RiskLine {
  label: string;
  maxFine: number;
  note: string;
}

function calculateRisks(properties: Property[]): RiskLine[] {
  const risks: RiskLine[] = [];

  const missingGas = properties.filter((p) => !p.compliance.gasSafety).length;
  if (missingGas > 0)
    risks.push({
      label: `Gas Safety (${missingGas} ${missingGas === 1 ? "property" : "properties"})`,
      maxFine: missingGas * 6000,
      note: "Up to £6,000 fine & potential criminal prosecution per property",
    });

  const missingEicr = properties.filter((p) => !p.compliance.eicr).length;
  if (missingEicr > 0)
    risks.push({
      label: `EICR (${missingEicr} ${missingEicr === 1 ? "property" : "properties"})`,
      maxFine: missingEicr * 30000,
      note: "Up to £30,000 civil penalty per property",
    });

  const missingEpc = properties.filter((p) => !p.compliance.epc).length;
  if (missingEpc > 0)
    risks.push({
      label: `EPC below 'E' (${missingEpc} ${missingEpc === 1 ? "property" : "properties"})`,
      maxFine: missingEpc * 5000,
      note: "Up to £5,000 fine per property",
    });

  const missingRra = properties.filter((p) => !p.compliance.rentersRightsAct2026).length;
  if (missingRra > 0)
    risks.push({
      label: `Renters' Rights Act (${missingRra} ${missingRra === 1 ? "property" : "properties"})`,
      maxFine: missingRra * 7000,
      note: "Up to £7,000 fine for first-time offences per property",
    });

  return risks;
}

interface Props {
  properties: Property[];
}

const RiskAssessmentCard = ({ properties }: Props) => {
  if (properties.length === 0) return null;

  const risks = calculateRisks(properties);
  const totalExposure = risks.reduce((sum, r) => sum + r.maxFine, 0);
  const isMultiProperty = properties.length > 1;

  if (risks.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: "hsl(var(--primary) / 0.12)" }}
          >
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Compliance Peace of Mind</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          All compliance items are in order. You're in good shape! 🎉
        </p>
      </div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: "hsl(var(--risk-warm) / 0.15)" }}
        >
          <ShieldAlert className="w-5 h-5" style={{ color: "hsl(var(--risk-warm))" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Compliance Peace of Mind</h3>
          <p className="text-xs text-muted-foreground">Potential legal exposure</p>
        </div>
      </div>

      {/* Total */}
      <div
        className="rounded-xl px-4 py-3"
        style={{ background: "hsl(var(--risk-warm-muted))" }}
      >
        <p className="text-xs font-medium text-muted-foreground mb-0.5">Maximum exposure</p>
        <p className="text-2xl font-bold" style={{ color: "hsl(var(--risk-warm))" }}>
          {fmt(totalExposure)}
        </p>
      </div>

      {/* Breakdown */}
      <ul className="space-y-2.5 relative">
        {risks.map((risk, i) => {
          const blurred = isMultiProperty && i > 0;
          return (
            <li
              key={risk.label}
              className={`flex items-start justify-between gap-3 text-sm ${blurred ? "select-none" : ""}`}
              style={blurred ? { filter: "blur(5px)" } : undefined}
              aria-hidden={blurred}
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{risk.label}</p>
                <p className="text-xs text-muted-foreground">{risk.note}</p>
              </div>
              <span className="shrink-0 font-semibold" style={{ color: "hsl(var(--risk-warm))" }}>
                {fmt(risk.maxFine)}
              </span>
            </li>
          );
        })}

        {/* Paywall overlay */}
        {isMultiProperty && risks.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 top-10 flex flex-col items-center justify-end pb-1 pointer-events-auto">
            <div className="flex items-center gap-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border px-3 py-2 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Upgrade to <span className="font-semibold text-foreground">Landy Pro</span> to see the full breakdown and unlock your 2026 Legal Shield pack.
              </span>
            </div>
          </div>
        )}
      </ul>

      {/* Action */}
      <Link
        to="/vault"
        className="flex items-center justify-center gap-1.5 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        style={{
          background: "hsl(var(--risk-warm) / 0.12)",
          color: "hsl(var(--risk-warm))",
        }}
      >
        How to fix this
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default RiskAssessmentCard;
