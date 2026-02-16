import { Droplet, Wrench, Zap, AlertTriangle, Bug, HelpCircle, Clock, CheckCircle2, ArrowUpCircle, Flame } from "lucide-react";
import type { MaintenanceRequest } from "@/hooks/useMaintenance";

const issueIcons: Record<string, typeof Droplet> = {
  damp_mould: Droplet,
  plumbing: Wrench,
  electrical: Zap,
  structural: AlertTriangle,
  log_burner: Flame,
  pest: Bug,
  other: HelpCircle,
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  open: { label: "Open", color: "hsl(var(--score-poor))", bg: "hsl(var(--score-poor) / 0.12)", icon: Clock },
  in_progress: { label: "In Progress", color: "hsl(var(--score-fair))", bg: "hsl(var(--score-fair) / 0.12)", icon: ArrowUpCircle },
  resolved: { label: "Resolved", color: "hsl(var(--score-excellent))", bg: "hsl(var(--score-excellent) / 0.12)", icon: CheckCircle2 },
  escalated: { label: "Escalated", color: "hsl(var(--risk-warm))", bg: "hsl(var(--risk-warm) / 0.12)", icon: AlertTriangle },
};

interface MaintenanceCardProps {
  request: MaintenanceRequest;
  onUpdateStatus: (id: string, status: string) => void;
}

const MaintenanceCard = ({ request, onUpdateStatus }: MaintenanceCardProps) => {
  const Icon = issueIcons[request.issue_type] || HelpCircle;
  const status = statusConfig[request.status] || statusConfig.open;
  const StatusIcon = status.icon;

  const isOverdue = request.remedial_deadline && new Date(request.remedial_deadline) < new Date() && request.status !== "resolved";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: request.issue_type === "damp_mould" ? "hsl(var(--risk-warm))" : "hsl(var(--primary))" }} />
          <span className="font-semibold text-xs text-foreground capitalize">{request.issue_type.replace("_", " & ")}</span>
          {isOverdue && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "hsl(var(--score-poor) / 0.12)", color: "hsl(var(--score-poor))" }}>
              OVERDUE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: status.bg }}>
          <StatusIcon className="w-3 h-3" style={{ color: status.color }} />
          <span className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{request.description}</p>

      {request.remedial_deadline && (
        <p className="text-[10px] text-muted-foreground">
          Deadline: {new Date(request.remedial_deadline).toLocaleDateString("en-GB")}
        </p>
      )}

      {request.status !== "resolved" && (
        <div className="flex gap-2">
          {request.status === "open" && (
            <button onClick={() => onUpdateStatus(request.id, "in_progress")}
              className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">
              Start Work
            </button>
          )}
          {(request.status === "open" || request.status === "in_progress") && (
            <>
              <button onClick={() => onUpdateStatus(request.id, "resolved")}
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                style={{ color: "hsl(var(--score-excellent))" }}>
                Resolve
              </button>
              <button onClick={() => onUpdateStatus(request.id, "escalated")}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                style={{ color: "hsl(var(--risk-warm))" }}>
                Escalate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceCard;
