import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Flame, Zap, Droplet, ClipboardList, Users, FileWarning, Scale, PoundSterling, Wrench, MessageSquare } from "lucide-react";
import { useTenancies } from "@/hooks/useTenancies";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useProperties } from "@/hooks/useProperties";
import { useUserTier } from "@/hooks/useUserTier";
import TenancyCard from "@/components/TenancyCard";
import AddTenancyForm from "@/components/AddTenancyForm";
import EditTenancyModal from "@/components/EditTenancyModal";
import NoticeWizard from "@/components/NoticeWizard";
import RentIncreaseForm from "@/components/RentIncreaseForm";
import MaintenanceForm from "@/components/MaintenanceForm";
import MaintenanceCard from "@/components/MaintenanceCard";
import CommsLogSection from "@/components/CommsLogSection";
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
  const { tenancies, legalNotices, rentIncreases, loading, addTenancy, endTenancy, updateTenancy, addRentIncrease, addLegalNotice } = useTenancies(propertyId);
  const { requests, commsLogs, loading: maintLoading, addRequest, updateRequestStatus, addCommsLog } = useMaintenance(propertyId);

  const [showAddTenancy, setShowAddTenancy] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [noticeTarget, setNoticeTarget] = useState<Tenancy | null>(null);
  const [rentTarget, setRentTarget] = useState<Tenancy | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tenancies" | "maintenance" | "comms">("tenancies");
  const [editTarget, setEditTarget] = useState<Tenancy | null>(null);

  const HeatingIcon = heatingMeta[heating].icon;
  const activeTenancies = tenancies.filter((t) => t.is_active);
  const pastTenancies = tenancies.filter((t) => !t.is_active);
  const openRequests = requests.filter((r) => r.status !== "resolved");

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

  const tabs = [
    { id: "tenancies" as const, label: "Tenancies", icon: Users },
    { id: "maintenance" as const, label: "Maintenance", icon: Wrench, badge: openRequests.length },
    { id: "comms" as const, label: "Comms Trail", icon: MessageSquare },
  ];

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

        {/* Tab navigation */}
        <div className="mx-auto max-w-lg px-4">
          <div className="flex border-t border-border">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative"
                  style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="text-[9px] font-bold px-1 py-px rounded-full" style={{
                      backgroundColor: "hsl(var(--score-poor) / 0.12)",
                      color: "hsl(var(--score-poor))",
                    }}>{tab.badge}</span>
                  )}
                  {active && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pb-10">
        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2 py-4">
          <Link
            to={inductionUrl}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-hygge-sage text-hygge-sage-foreground px-3 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Induction
          </Link>
          <button
            onClick={() => { setActiveTab("tenancies"); setShowAddTenancy(true); }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Tenancy
          </button>
          <button
            onClick={() => { setActiveTab("maintenance"); setShowMaintenanceForm(true); }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Issue
          </button>
        </div>

        {/* === TENANCIES TAB === */}
        {activeTab === "tenancies" && (
          <>
            {showAddTenancy && (
              <div className="mb-5">
                <AddTenancyForm
                  propertyId={propertyId}
                  onAdd={(data) => { addTenancy(data); setShowAddTenancy(false); }}
                  onCancel={() => setShowAddTenancy(false)}
                />
              </div>
            )}

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
                    <TenancyCard key={t.id} tenancy={t} onEnd={endTenancy}
                      onEdit={(t) => setEditTarget(t)}
                      onRentIncrease={(t) => setRentTarget(t)} onServeNotice={(t) => setNoticeTarget(t)} />
                  ))}
                </div>
              )}
            </section>

            {legalNotices.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Legal Notices
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
                      }}>{n.status}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {rentIncreases.length > 0 && (
              <section className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <PoundSterling className="w-3.5 h-3.5" /> Rent History
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

            {pastTenancies.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past Tenancies</h2>
                <div className="space-y-3 opacity-60">
                  {pastTenancies.map((t) => (
                    <TenancyCard key={t.id} tenancy={t} onEnd={() => {}} onEdit={() => {}} onRentIncrease={() => {}} onServeNotice={() => {}} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* === MAINTENANCE TAB === */}
        {activeTab === "maintenance" && (
          <>
            {showMaintenanceForm && (
              <div className="mb-5">
                <MaintenanceForm
                  onSubmit={(data) => { addRequest(data); setShowMaintenanceForm(false); }}
                  onCancel={() => setShowMaintenanceForm(false)}
                />
              </div>
            )}

            {!showMaintenanceForm && (
              <button
                onClick={() => setShowMaintenanceForm(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors mb-4"
              >
                <Plus className="w-3.5 h-3.5" />
                Report New Issue
              </button>
            )}

            {maintLoading ? (
              <div className="text-center py-6"><span className="landy-spinner" /></div>
            ) : requests.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <Wrench className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No maintenance issues reported.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <MaintenanceCard key={r.id} request={r} onUpdateStatus={updateRequestStatus} />
                ))}
              </div>
            )}
          </>
        )}

        {/* === COMMS TAB === */}
        {activeTab === "comms" && (
          <div className="pt-2">
            <CommsLogSection logs={commsLogs} requests={requests} onAdd={addCommsLog} />
          </div>
        )}
      </div>

      {/* Modals */}
      {noticeTarget && (
        <NoticeWizard tenancy={noticeTarget}
          onSubmit={(data) => { addLegalNotice(data); setNoticeTarget(null); }}
          onClose={() => setNoticeTarget(null)} />
      )}
      {rentTarget && (
        <RentIncreaseForm tenancy={rentTarget}
          onSubmit={(data) => { addRentIncrease(data); setRentTarget(null); }}
          onClose={() => setRentTarget(null)} />
      )}
      {editTarget && (
        <EditTenancyModal tenancy={editTarget}
          onSave={(id, data) => { updateTenancy(id, data); setEditTarget(null); }}
          onClose={() => setEditTarget(null)} />
      )}
      <ProUpsellModal open={proModalOpen} onClose={() => setProModalOpen(false)} />
    </div>
  );
};

export default PropertyDetailPage;
