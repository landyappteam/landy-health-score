import { useState } from "react";
import { FileWarning, Scale, AlertTriangle, ArrowRight, ArrowLeft, Check } from "lucide-react";
import type { Tenancy } from "@/hooks/useTenancies";

interface NoticeWizardProps {
  tenancy: Tenancy;
  onSubmit: (data: {
    tenancy_id: string;
    notice_type: "section_8" | "section_13";
    grounds?: string[];
    notice_date: string;
    expiry_date?: string;
    notes?: string;
  }) => void;
  onClose: () => void;
}

const SECTION_8_GROUNDS = [
  { id: "ground1", label: "Ground 1 — Landlord wishes to occupy", desc: "You or a family member intends to live in the property." },
  { id: "ground1a", label: "Ground 1A — Sale of property", desc: "The property is being sold (new 2026 ground)." },
  { id: "ground2", label: "Ground 2 — Mortgage possession", desc: "The mortgage lender requires possession." },
  { id: "ground6", label: "Ground 6 — Redevelopment", desc: "Substantial works that cannot be done with tenant in situ." },
  { id: "ground8", label: "Ground 8 — Serious rent arrears", desc: "At least 2 months' rent arrears at both notice and hearing." },
  { id: "ground10", label: "Ground 10 — Some rent arrears", desc: "Some rent is unpaid at notice date." },
  { id: "ground12", label: "Ground 12 — Breach of tenancy", desc: "Tenant has broken a term of the tenancy agreement." },
  { id: "ground14", label: "Ground 14 — Anti-social behaviour", desc: "Tenant or visitor has caused nuisance or annoyance." },
];

const NoticeWizard = ({ tenancy, onSubmit, onClose }: NoticeWizardProps) => {
  const [step, setStep] = useState(0);
  const [noticeType, setNoticeType] = useState<"section_8" | "section_13" | null>(null);
  const [selectedGrounds, setSelectedGrounds] = useState<string[]>([]);
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const toggleGround = (id: string) => {
    setSelectedGrounds((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const calculateExpiry = () => {
    const d = new Date(noticeDate);
    if (noticeType === "section_13") {
      d.setMonth(d.getMonth() + 2);
    } else {
      // Section 8 notice periods vary by ground, use 2 months as default
      const hasGround14 = selectedGrounds.includes("ground14");
      if (hasGround14) {
        // Immediate for anti-social behaviour
        d.setDate(d.getDate() + 14);
      } else {
        d.setMonth(d.getMonth() + 2);
      }
    }
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = () => {
    if (!noticeType) return;
    onSubmit({
      tenancy_id: tenancy.id,
      notice_type: noticeType,
      grounds: noticeType === "section_8" ? selectedGrounds : undefined,
      notice_date: noticeDate,
      expiry_date: calculateExpiry(),
      notes: notes.trim() || undefined,
    });
  };

  const canProceed = () => {
    if (step === 0) return !!noticeType;
    if (step === 1 && noticeType === "section_8") return selectedGrounds.length > 0;
    return true;
  };

  const totalSteps = noticeType === "section_8" ? 3 : 2;

  // Arrears validation for Ground 8
  const hasGround8 = selectedGrounds.includes("ground8");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "hsl(var(--risk-warm) / 0.12)" }}>
                <FileWarning className="w-4 h-4" style={{ color: "hsl(var(--risk-warm))" }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Legal Notice Wizard</h2>
                <p className="text-xs text-muted-foreground">Section 21 is abolished — 2026 rules apply</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
          </div>
          {/* Progress */}
          <div className="flex gap-1 mt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i <= step ? "hsl(var(--primary))" : "hsl(var(--border))" }} />
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Step 0: Choose type */}
          {step === 0 && (
            <>
              <p className="text-sm text-foreground font-medium">What type of notice?</p>
              <div className="space-y-2">
                <button
                  onClick={() => setNoticeType("section_8")}
                  className="w-full rounded-xl border-2 p-4 text-left transition-all"
                  style={{
                    borderColor: noticeType === "section_8" ? "hsl(var(--primary))" : "hsl(var(--border))",
                    backgroundColor: noticeType === "section_8" ? "hsl(var(--primary) / 0.05)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">Section 8 — Possession</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Seek possession on specific legal grounds (e.g. arrears, sale, occupation). Requires valid grounds.</p>
                </button>
                <button
                  onClick={() => setNoticeType("section_13")}
                  className="w-full rounded-xl border-2 p-4 text-left transition-all"
                  style={{
                    borderColor: noticeType === "section_13" ? "hsl(var(--primary))" : "hsl(var(--border))",
                    backgroundColor: noticeType === "section_13" ? "hsl(var(--primary) / 0.05)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4" style={{ color: "hsl(var(--score-fair))" }} />
                    <span className="font-semibold text-sm text-foreground">Section 13 — Rent Increase</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Formal notice to increase rent. Minimum 2 months' notice. Once per 12 months only.</p>
                </button>
              </div>

              {/* 2026 info box */}
              <div className="rounded-xl p-3" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.08)" }}>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">2026 Law:</strong> Section 21 "no-fault" evictions are abolished. All possession must now use Section 8 with valid grounds.
                </p>
              </div>
            </>
          )}

          {/* Step 1 (Section 8): Choose grounds */}
          {step === 1 && noticeType === "section_8" && (
            <>
              <p className="text-sm text-foreground font-medium">Select legal grounds</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {SECTION_8_GROUNDS.map((ground) => {
                  const selected = selectedGrounds.includes(ground.id);
                  return (
                    <button
                      key={ground.id}
                      onClick={() => toggleGround(ground.id)}
                      className="w-full rounded-lg border p-3 text-left transition-all"
                      style={{
                        borderColor: selected ? "hsl(var(--primary))" : "hsl(var(--border))",
                        backgroundColor: selected ? "hsl(var(--primary) / 0.05)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0" style={{
                          borderColor: selected ? "hsl(var(--primary))" : "hsl(var(--border))",
                          backgroundColor: selected ? "hsl(var(--primary))" : "transparent",
                        }}>
                          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{ground.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{ground.desc}</p>
                    </button>
                  );
                })}
              </div>
              {hasGround8 && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "hsl(var(--risk-warm) / 0.1)" }}>
                  <p className="text-xs" style={{ color: "hsl(var(--risk-warm))" }}>
                    <strong>Ground 8 requires:</strong> At least 2 months' rent arrears at both the date of notice AND the court hearing. Ensure evidence is documented.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Final step: Date & Notes */}
          {((step === 1 && noticeType === "section_13") || (step === 2 && noticeType === "section_8")) && (
            <>
              <p className="text-sm text-foreground font-medium">Notice details</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notice Date</label>
                  <input
                    type="date"
                    value={noticeDate}
                    onChange={(e) => setNoticeDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-1">Calculated expiry</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(calculateExpiry()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any additional context..."
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "hsl(var(--risk-warm))" }}
            >
              <FileWarning className="w-3.5 h-3.5" />
              Create Notice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeWizard;
