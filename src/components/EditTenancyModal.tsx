import { useState } from "react";
import { X, Pencil } from "lucide-react";
import type { Tenancy } from "@/hooks/useTenancies";

interface EditTenancyModalProps {
  tenancy: Tenancy;
  onSave: (id: string, data: {
    tenant_name: string;
    tenant_email?: string | null;
    tenant_phone?: string | null;
    start_date: string;
    monthly_rent: number;
    deposit_amount?: number | null;
    deposit_scheme_ref?: string | null;
  }) => void;
  onClose: () => void;
}

const EditTenancyModal = ({ tenancy, onSave, onClose }: EditTenancyModalProps) => {
  const [name, setName] = useState(tenancy.tenant_name);
  const [email, setEmail] = useState(tenancy.tenant_email || "");
  const [phone, setPhone] = useState(tenancy.tenant_phone || "");
  const [startDate, setStartDate] = useState(tenancy.start_date);
  const [rent, setRent] = useState(String(tenancy.monthly_rent));
  const [deposit, setDeposit] = useState(tenancy.deposit_amount ? String(tenancy.deposit_amount) : "");
  const [schemeRef, setSchemeRef] = useState(tenancy.deposit_scheme_ref || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rent) return;
    onSave(tenancy.id, {
      tenant_name: name.trim(),
      tenant_email: email.trim() || null,
      tenant_phone: phone.trim() || null,
      start_date: startDate,
      monthly_rent: parseFloat(rent),
      deposit_amount: deposit ? parseFloat(deposit) : null,
      deposit_scheme_ref: schemeRef.trim() || null,
    });
  };

  const inputClass = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Edit Tenancy</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">All tenancies are periodic (rolling) under the 2026 Renters' Rights Act.</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tenant Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputClass} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tenant@email.com" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07..." className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Monthly Rent (£) *</label>
              <input type="number" step="0.01" min="0" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="1200" className={inputClass} required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Deposit (£)</label>
              <input type="number" step="0.01" min="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="1200" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Deposit Scheme Ref</label>
              <input value={schemeRef} onChange={(e) => setSchemeRef(e.target.value)} placeholder="DPS-12345" className={inputClass} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!name.trim() || !rent}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTenancyModal;
