import { useState } from "react";
import { MessageSquare, Send, Lock } from "lucide-react";
import type { CommunicationLog, MaintenanceRequest } from "@/hooks/useMaintenance";

const METHOD_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "phone", label: "Phone" },
  { value: "in_person", label: "In Person" },
  { value: "letter", label: "Letter" },
  { value: "other", label: "Other" },
];

interface CommsLogSectionProps {
  logs: CommunicationLog[];
  requests: MaintenanceRequest[];
  onAdd: (data: { tenant_name: string; method: string; summary: string; related_request_id?: string }) => void;
}

const CommsLogSection = ({ logs, requests, onAdd }: CommsLogSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [tenantName, setTenantName] = useState("");
  const [method, setMethod] = useState("email");
  const [summary, setSummary] = useState("");
  const [relatedId, setRelatedId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !summary.trim()) return;
    onAdd({
      tenant_name: tenantName.trim(),
      method,
      summary: summary.trim(),
      related_request_id: relatedId || undefined,
    });
    setTenantName("");
    setSummary("");
    setRelatedId("");
    setShowForm(false);
  };

  const inputClass = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          Communication Trail
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {showForm ? "Cancel" : "+ Log Contact"}
        </button>
      </div>

      {/* Immutable notice */}
      <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.08)" }}>
        <Lock className="w-3 h-3" style={{ color: "hsl(var(--hygge-sage))" }} />
        <p className="text-[10px] text-muted-foreground">This is an immutable audit trail. Entries cannot be edited or deleted.</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-3 mb-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tenant Name *</label>
              <input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Name" className={inputClass} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                {METHOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Summary *</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2}
              placeholder="Summarise the communication..." className={`${inputClass} resize-none`} required />
          </div>
          {requests.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Related Issue (optional)</label>
              <select value={relatedId} onChange={(e) => setRelatedId(e.target.value)} className={inputClass}>
                <option value="">None</option>
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>{r.issue_type.replace("_", " & ")} — {r.description.slice(0, 40)}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" disabled={!tenantName.trim() || !summary.trim()}
            className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
            <Send className="w-3.5 h-3.5" /> Log Communication
          </button>
        </form>
      )}

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">No communications logged yet.</p>
        </div>
      ) : (
        <div className="space-y-0 relative">
          <div className="absolute left-4 top-2 bottom-2 w-px" style={{ backgroundColor: "hsl(var(--border))" }} />
          {logs.map((log) => (
            <div key={log.id} className="relative pl-9 py-3">
              <div className="absolute left-[11px] top-5 w-2.5 h-2.5 rounded-full border-2 border-card" style={{ backgroundColor: "hsl(var(--primary))" }} />
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">{log.tenant_name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize px-1.5 py-0.5 rounded bg-muted">{log.method.replace("_", " ")}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{log.summary}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {new Date(log.logged_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CommsLogSection;
