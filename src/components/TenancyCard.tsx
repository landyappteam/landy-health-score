import { Users, Calendar, PoundSterling, Ban, FileWarning, Pencil } from "lucide-react";
import type { Tenancy } from "@/hooks/useTenancies";

interface TenancyCardProps {
  tenancy: Tenancy;
  onEnd: (id: string) => void;
  onEdit: (tenancy: Tenancy) => void;
  onRentIncrease: (tenancy: Tenancy) => void;
  onServeNotice: (tenancy: Tenancy) => void;
}

const TenancyCard = ({ tenancy, onEnd, onEdit, onRentIncrease, onServeNotice }: TenancyCardProps) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{tenancy.tenant_name}</span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: tenancy.is_active ? "hsl(var(--score-excellent) / 0.12)" : "hsl(var(--muted))",
            color: tenancy.is_active ? "hsl(var(--score-excellent))" : "hsl(var(--muted-foreground))",
          }}
        >
          {tenancy.is_active ? "Active (Periodic)" : "Ended"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          Started {new Date(tenancy.start_date).toLocaleDateString("en-GB")}
        </div>
        <div className="flex items-center gap-1.5">
          <PoundSterling className="w-3 h-3" />
          {fmt(tenancy.monthly_rent)}/month
        </div>
        {tenancy.end_date && (
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-3 h-3" />
            Ended {new Date(tenancy.end_date).toLocaleDateString("en-GB")}
          </div>
        )}
      </div>

      {tenancy.is_active && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onEdit(tenancy)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => onRentIncrease(tenancy)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            <PoundSterling className="w-3 h-3" />
            Rent Increase
          </button>
          <button
            onClick={() => onServeNotice(tenancy)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            <FileWarning className="w-3 h-3" />
            Serve Notice
          </button>
          <button
            onClick={() => onEnd(tenancy.id)}
            className="flex items-center justify-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Ban className="w-3 h-3" />
            End
          </button>
        </div>
      )}
    </div>
  );
};

export default TenancyCard;
