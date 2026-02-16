import { useState } from "react";
import { UserPlus } from "lucide-react";

interface AddTenancyFormProps {
  propertyId: string;
  onAdd: (data: {
    property_id: string;
    tenant_name: string;
    tenant_email?: string;
    tenant_phone?: string;
    start_date: string;
    monthly_rent: number;
    deposit_amount?: number;
    deposit_scheme_ref?: string;
  }) => void;
  onCancel: () => void;
}

const AddTenancyForm = ({ propertyId, onAdd, onCancel }: AddTenancyFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [schemeRef, setSchemeRef] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rent) return;
    onAdd({
      property_id: propertyId,
      tenant_name: name.trim(),
      tenant_email: email.trim() || undefined,
      tenant_phone: phone.trim() || undefined,
      start_date: startDate,
      monthly_rent: parseFloat(rent),
      deposit_amount: deposit ? parseFloat(deposit) : undefined,
      deposit_scheme_ref: schemeRef.trim() || undefined,
    });
  };

  const inputClass = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30";

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">New Periodic Tenancy</h3>
      </div>
      <p className="text-xs text-muted-foreground">Under the 2026 Renters' Rights Act, all tenancies are periodic (rolling). No fixed terms.</p>

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
          Create Tenancy
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddTenancyForm;
