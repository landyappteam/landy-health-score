import { useState } from "react";
import { Home, FolderOpen, Camera, LogOut } from "lucide-react";
import emptyStateImg from "@/assets/empty-state-home.png";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ComplianceScore from "@/components/ComplianceScore";
import PropertyCard from "@/components/PropertyCard";
import AddPropertyForm from "@/components/AddPropertyForm";
import EpcOptimiserModal from "@/components/EpcOptimiserModal";
import RiskAssessmentCard from "@/components/RiskAssessmentCard";
import DocumentScanner from "@/components/DocumentScanner";
import TenantPackModal from "@/components/TenantPackModal";
import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const { properties, documents, addProperty, toggleCompliance, toggleNA, removeProperty, healthScore } =
    useProperties();
  const { signOut } = useAuth();
  const [epcModalOpen, setEpcModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [packPropertyId, setPackPropertyId] = useState<string | null>(null);

  const packProperty = packPropertyId ? properties.find((p) => p.id === packPropertyId) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-8">
        {/* Header */}
        <header className="flex items-center justify-between pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Home className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Landy</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <Camera className="w-4 h-4" />
              Scan
            </button>
            <Link
              to="/vault"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Vault
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Score */}
        <ComplianceScore score={healthScore} propertyCount={properties.length} />

        {/* Risk Assessment */}
        <RiskAssessmentCard properties={properties} />

        {/* Add Property – cream card */}
        <div className="mb-5 rounded-2xl border border-border bg-hygge-cream p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Add Property
          </h2>
          <AddPropertyForm onAdd={addProperty} />
        </div>

        {/* Properties List */}
        {properties.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Properties
            </h2>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onToggle={toggleCompliance}
                onToggleNA={toggleNA}
                onRemove={removeProperty}
                onEpcOptimise={() => setEpcModalOpen(true)}
                onGeneratePack={(id) => setPackPropertyId(id)}
              />
            ))}
          </div>
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
              Landy keeps your properties compliant and your mind at ease. Add your first home to get started.
            </p>
            <button
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[placeholder="Enter postcode…"]');
                input?.focus();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              Start your peaceful management journey
            </button>
          </div>
        )}
      </div>

      <EpcOptimiserModal open={epcModalOpen} onClose={() => setEpcModalOpen(false)} />
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
