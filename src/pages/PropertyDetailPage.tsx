import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Home, Plus, Flame, Zap, Droplet, ClipboardList, Users, FileWarning, Scale, PoundSterling } from "lucide-react";
import { useTenancies } from "@/hooks/useTenancies";
import { useProperties } from "@/hooks/useProperties";
import { useUserTier } from "@/hooks/useUserTier";
import TenancyCard from "@/components/TenancyCard";
import AddTenancyForm from "@/components/AddTenancyForm";
import NoticeWizard from "@/components/NoticeWizard";
import RentIncreaseForm from "@/components/RentIncreaseForm";
import ProUpsellModal from "@/components/ProUpsellModal";
import type { Tenancy } from "@/hooks/useTenancies";
import type { HeatingType } from "@/types/property";

const heatingMeta: Record<HeatingType, { icon: typeof Flame; label: string }> = {
  gas: { icon: Flame, label: "Gas" },
  electric: { icon: Zap, label: "Electric" },
  oil: { icon: Droplet, label: "Oil" },
};

const PropertyDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyId = searchParams.get("id") || "";
  const address = searchParams.get("address") || "Property";
  const heating = (searchParams.get("heating") as HeatingType) || "gas";

  const { properties } = useProperties();
  const { tier } = useUserTier();
  const isPro = tier === "pro";
  const { tenancies, legalNotices, rentIncreases, loading, addTenancy, endTenancy, addRentIncrease, addLegalNotice } = useTenancies(propertyId);

  const [showAddTenancy, setShowAddTenancy] = useState(false);
  const [noticeTarget, setNoticeTarget] = useState<Tenancy | null>(null);
  const [rentTarget, setRentTarget] = useState<Tenancy | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false);

  const HeatingIcon = heatingMeta[heating].icon;
  const activeTenancies = tenancies.filter((t) => t.is_active);
  const pastTenancies = tenancies.filter((t) => !t.is_active);

  if (!propertyId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Property not found.</p>
          <button onClick={() => navigate("/")} className="text-sm text-primary underline">Back to dashboard</button>
        </div>
      </div>
    );
  }

  const inductionUrl = `/induction?propertyId=${propertyId}&address=${encodeURIComponent(address)}&heating=${heating}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border shadow-sm" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}>
                <HeatingIcon className="w-3.5 h-3.5" style={{ color: "hsl(var(--hygge-sage))" }} />
              </div>
              <h1 className="text-sm font-bold text-foreground truncate">{address}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-10">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 py-5">
          <Link
            to={inductionUrl}
            className="flex items-center justify-center gap-2 rounded-xl bg-hygge-sage text-hygge-sage-foreground px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ClipboardList className="w-4 h-4" />
            Tenant Induction
          </Link>
          <button
            onClick={() => setShowAddTenancy(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Tenancy
          </button>
        </div>

        {/* Add tenancy form */}
        {showAddTenancy && (
          <div className="mb-5">
            <AddTenancyForm
              propertyId={propertyId}
              onAdd={(data) => { addTenancy(data); setShowAddTenancy(false); }}
              onCancel={() => setShowAddTenancy(false)}
            />
          </div>
        )}

        {/* Active tenancies */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Active Tenancies
          </h2>
          {loading ? (
            <div className="text-center py-6"><span className="landy-spinner" /></div>
          ) : activeTenancies.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="text-sm text-muted-foreground">No active tenancies. Add one to start managing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTenancies.map((t) => (
                <TenancyCard
                  key={t.id}
                  tenancy={t}
                  onEnd={endTenancy}
                  onRentIncrease={(t) => setRentTarget(t)}
                  onServeNotice={(t) => setNoticeTarget(t)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Legal notices */}
        {legalNotices.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Legal Notices
            </h2>
            <div className="space-y-2">
              {legalNotices.map((n) => (
                <div key={n.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-foreground">
                      {n.notice_type === "section_8" ? "Section 8" : "Section 13"}
                    </span>
                    {n.grounds && n.grounds.length > 0 && (
                      <p className="text-[10px] text-muted-foreground">{n.grounds.join(", ")}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                    backgroundColor: n.status === "served" ? "hsl(var(--risk-warm) / 0.12)" : "hsl(var(--muted))",
                    color: n.status === "served" ? "hsl(var(--risk-warm))" : "hsl(var(--muted-foreground))",
                  }}>
                    {n.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rent increase history */}
        {rentIncreases.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <PoundSterling className="w-3.5 h-3.5" />
              Rent Increase History
            </h2>
            <div className="space-y-2">
              {rentIncreases.map((ri) => {
                const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
                return (
                  <div key={ri.id} className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-foreground">{fmt(ri.current_rent)} → {fmt(ri.new_rent)}</span>
                      <p className="text-[10px] text-muted-foreground">Effective {new Date(ri.effective_date).toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Past tenancies */}
        {pastTenancies.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past Tenancies</h2>
            <div className="space-y-3 opacity-60">
              {pastTenancies.map((t) => (
                <TenancyCard key={t.id} tenancy={t} onEnd={() => {}} onRentIncrease={() => {}} onServeNotice={() => {}} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      {noticeTarget && (
        <NoticeWizard
          tenancy={noticeTarget}
          onSubmit={(data) => { addLegalNotice(data); setNoticeTarget(null); }}
          onClose={() => setNoticeTarget(null)}
        />
      )}
      {rentTarget && (
        <RentIncreaseForm
          tenancy={rentTarget}
          onSubmit={(data) => { addRentIncrease(data); setRentTarget(null); }}
          onClose={() => setRentTarget(null)}
        />
      )}
      <ProUpsellModal open={proModalOpen} onClose={() => setProModalOpen(false)} />
    </div>
  );
};

export default PropertyDetailPage;
