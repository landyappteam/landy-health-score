import { useState } from "react";
import { Home, FolderOpen, Camera, LogOut, ChevronRight } from "lucide-react";
import emptyStateImg from "@/assets/empty-state-home.png";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TrafficLightScore from "@/components/TrafficLightScore";
import PropertyCard from "@/components/PropertyCard";
import AddPropertyForm from "@/components/AddPropertyForm";
import EpcOptimiserModal from "@/components/EpcOptimiserModal";
import RiskAssessmentCard from "@/components/RiskAssessmentCard";
import ActionCenter from "@/components/ActionCenter";
import DocumentScanner from "@/components/DocumentScanner";
import TenantPackModal from "@/components/TenantPackModal";
import ProUpsellModal from "@/components/ProUpsellModal";
import { useProperties } from "@/hooks/useProperties";
import { useUserTier } from "@/hooks/useUserTier";

const Index = () => {
  const { properties, documents, addProperty, toggleCompliance, toggleNA, removeProperty, healthScore } =
    useProperties();
  const { signOut } = useAuth();
  const [epcModalOpen, setEpcModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [packPropertyId, setPackPropertyId] = useState<string | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const { tier } = useUserTier();
  const isPro = tier === "pro";

  const packProperty = packPropertyId ? properties.find((p) => p.id === packPropertyId) : null;

  // Urgent actions count
  const urgentCount = properties.filter(
    (p) => !p.compliance.gasSafety || !p.compliance.eicr || !p.compliance.epc
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b border-border shadow-sm" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="mx-auto max-w-lg px-4">
          <header className="flex items-center justify-between pt-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Home className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Landlord Guard</h1>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setScannerOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Scan
              </button>
              <Link
                to="/vault"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Vault
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>
          <div className="pb-3">
            <AddPropertyForm onAdd={addProperty} />
          </div>
        </div>
      </div>

      {/* Command Centre */}
      <div className="mx-auto max-w-lg px-4 pb-10">
        <section className="py-6 space-y-4">
          {/* Traffic Light Score */}
          <TrafficLightScore score={healthScore} propertyCount={properties.length} />

          {/* 2026 Alerts */}
          <ActionCenter properties={properties} />

          {/* Risk Assessment */}
          <RiskAssessmentCard properties={properties} />
        </section>

        {/* Properties List */}
        {properties.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Your Properties
            </h2>
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id}>
                  <PropertyCard
                    property={property}
                    isPro={isPro}
                    onToggle={toggleCompliance}
                    onToggleNA={toggleNA}
                    onRemove={removeProperty}
                    onEpcOptimise={() => isPro ? setEpcModalOpen(true) : setProModalOpen(true)}
                    onGeneratePack={(id) => isPro ? setPackPropertyId(id) : setProModalOpen(true)}
                    onProUpsell={() => setProModalOpen(true)}
                  />
                  {/* Property detail link */}
                  <Link
                    to={`/property?id=${property.id}&address=${encodeURIComponent(property.address)}&heating=${property.heatingType || "gas"}`}
                    className="flex items-center justify-between mt-2 rounded-lg border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                  >
                    <span>Tenancies, Notices & Finance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {properties.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <img
              src={emptyStateImg}
              alt="A cosy cottage with warm light"
              className="w-40 h-40 mx-auto mb-5 rounded-2xl object-cover opacity-90"
            />
            <h3 className="text-lg font-semibold text-foreground mb-1.5">
              Everything in order, nothing to worry about.
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-xs mx-auto">
              Landlord Guard keeps your properties compliant and your mind at ease. Add your first home to get started.
            </p>
            <button
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[placeholder="Enter postcode…"]');
                input?.focus();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              Start your compliance journey
            </button>
          </div>
        )}
      </div>

      <EpcOptimiserModal open={epcModalOpen} onClose={() => setEpcModalOpen(false)} />
      <ProUpsellModal open={proModalOpen} onClose={() => setProModalOpen(false)} />
      {scannerOpen && <DocumentScanner onClose={() => setScannerOpen(false)} />}
      {packProperty && (
        <TenantPackModal
          property={packProperty}
          documents={documents}
          onClose={() => setPackPropertyId(null)}
        />
      )}
    </div>
  );
};

export default Index;
