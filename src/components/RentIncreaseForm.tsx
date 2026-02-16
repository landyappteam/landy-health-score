import { useState, useMemo } from "react";
import { PoundSterling, Info } from "lucide-react";
import type { Tenancy } from "@/hooks/useTenancies";

interface RentIncreaseFormProps {
  tenancy: Tenancy;
  onSubmit: (data: {
    tenancy_id: string;
    current_rent: number;
    new_rent: number;
    notice_served_date: string;
    effective_date: string;
  }) => void;
  onClose: () => void;
}

const RentIncreaseForm = ({ tenancy, onSubmit, onClose }: RentIncreaseFormProps) => {
  const [newRent, setNewRent] = useState("");
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split("T")[0]);

  const minEffectiveDate = useMemo(() => {
    const d = new Date(noticeDate);
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().split("T")[0];
  }, [noticeDate]);

  const [effectiveDate, setEffectiveDate] = useState(minEffectiveDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRent || parseFloat(newRent) <= tenancy.monthly_rent) return;
    onSubmit({
      tenancy_id: tenancy.id,
      current_rent: tenancy.monthly_rent,
      new_rent: parseFloat(newRent),
      notice_served_date: noticeDate,
      effective_date: effectiveDate || minEffectiveDate,
    });
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PoundSterling className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Section 13 Rent Increase</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
        </div>

        <div className="rounded-xl p-3" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.08)" }}>
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "hsl(var(--hygge-sage))" }} />
            <p className="text-xs text-muted-foreground">
              Under 2026 rules, rent can only increase <strong>once every 12 months</strong> with a minimum <strong>2 months' notice</strong> via a Section 13 Notice. Rental bidding is banned.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border p-3 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Current rent</span>
            <span className="text-sm font-semibold text-foreground">{fmt(tenancy.monthly_rent)}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">New Monthly Rent (£)</label>
            <input
              type="number" step="0.01" min={tenancy.monthly_rent + 1}
              value={newRent} onChange={(e) => setNewRent(e.target.value)}
              placeholder={`More than ${fmt(tenancy.monthly_rent)}`}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notice Served Date</label>
            <input type="date" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Effective Date (min 2 months)</label>
            <input type="date" value={effectiveDate || minEffectiveDate} min={minEffectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" required />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={!newRent || parseFloat(newRent) <= tenancy.monthly_rent}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
            Record Increase
          </button>
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentIncreaseForm;
