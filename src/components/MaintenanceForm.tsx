import { useState } from "react";
import { AlertTriangle, Droplet, Wrench, Zap, Bug, HelpCircle, Camera, Plus } from "lucide-react";

const ISSUE_TYPES = [
  { value: "damp_mould", label: "Damp & Mould", icon: Droplet, color: "hsl(var(--risk-warm))" },
  { value: "plumbing", label: "Plumbing", icon: Wrench, color: "hsl(var(--primary))" },
  { value: "electrical", label: "Electrical", icon: Zap, color: "hsl(var(--score-fair))" },
  { value: "structural", label: "Structural", icon: AlertTriangle, color: "hsl(var(--score-poor))" },
  { value: "pest", label: "Pest Control", icon: Bug, color: "hsl(var(--muted-foreground))" },
  { value: "other", label: "Other", icon: HelpCircle, color: "hsl(var(--muted-foreground))" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "hsl(var(--score-excellent))" },
  { value: "medium", label: "Medium", color: "hsl(var(--score-fair))" },
  { value: "high", label: "High", color: "hsl(var(--risk-warm))" },
  { value: "emergency", label: "Emergency", color: "hsl(var(--score-poor))" },
];

interface MaintenanceFormProps {
  onSubmit: (data: {
    issue_type: string;
    description: string;
    priority: string;
    remedial_deadline?: string;
  }) => void;
  onCancel: () => void;
}

const MaintenanceForm = ({ onSubmit, onCancel }: MaintenanceFormProps) => {
  const [issueType, setIssueType] = useState("damp_mould");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  const isDampMould = issueType === "damp_mould";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({
      issue_type: issueType,
      description: description.trim(),
      priority,
      remedial_deadline: deadline || undefined,
    });
  };

  const inputClass = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-score-poor" />
        <h3 className="text-sm font-bold text-foreground">Report Maintenance Issue</h3>
      </div>

      {/* Issue type selector */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Issue Type</label>
        <div className="grid grid-cols-3 gap-2">
          {ISSUE_TYPES.map(({ value, label, icon: Icon, color }) => {
            const selected = issueType === value;
            return (
              <button
                key={value} type="button"
                onClick={() => setIssueType(value)}
                className="flex items-center justify-center gap-1.5 rounded-lg border-2 px-2 py-2 text-xs font-medium transition-all"
                style={{
                  borderColor: selected ? color : "hsl(var(--border))",
                  backgroundColor: selected ? `${color}10` : "transparent",
                  color: selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                <Icon className="w-3 h-3" style={{ color: selected ? color : undefined }} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Awaab's Law warning for damp/mould */}
      {isDampMould && (
        <div className="rounded-xl p-3" style={{ backgroundColor: "hsl(var(--risk-warm) / 0.1)" }}>
          <p className="text-xs" style={{ color: "hsl(var(--risk-warm))" }}>
            <strong>Awaab's Law (2026):</strong> Landlords must investigate damp/mould within <strong>14 days</strong> and begin remedial works within <strong>7 days</strong> of investigation. Failure can result in an unlimited fine.
          </p>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3} placeholder={isDampMould ? "Describe the location, extent, and any visible damage..." : "Describe the issue..."}
          className={`${inputClass} resize-none`} required
        />
      </div>

      {/* Priority */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Priority</label>
        <div className="flex gap-2">
          {PRIORITIES.map(({ value, label, color }) => {
            const selected = priority === value;
            return (
              <button
                key={value} type="button"
                onClick={() => setPriority(value)}
                className="flex-1 rounded-lg border-2 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderColor: selected ? color : "hsl(var(--border))",
                  backgroundColor: selected ? `${color}15` : "transparent",
                  color: selected ? color : "hsl(var(--muted-foreground))",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Remedial deadline */}
      {isDampMould && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Remedial Deadline</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
          <p className="text-[10px] text-muted-foreground mt-1">Set based on Awaab's Law timelines</p>
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={!description.trim()}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
          Report Issue
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MaintenanceForm;
