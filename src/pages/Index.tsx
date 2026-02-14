import { useState } from "react";
import { Home, FolderOpen, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import ComplianceScore from "@/components/ComplianceScore";
import PropertyCard from "@/components/PropertyCard";
import AddPropertyForm from "@/components/AddPropertyForm";
import EpcOptimiserModal from "@/components/EpcOptimiserModal";
import RiskAssessmentCard from "@/components/RiskAssessmentCard";
import DocumentScanner from "@/components/DocumentScanner";
import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const { properties, addProperty, toggleCompliance, removeProperty, healthScore } =
    useProperties();
  const [epcModalOpen, setEpcModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

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
          <div className="flex items-center gap-2">
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
          </div>
        </header>

        {/* Score */}
        <ComplianceScore score={healthScore} propertyCount={properties.length} />

        {/* Risk Assessment */}
        <RiskAssessmentCard properties={properties} />

        {/* Add Property */}
        <div className="mb-5">
          <AddPropertyForm onAdd={addProperty} />
        </div>

        {/* Properties List */}
        {properties.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Your Properties
            </h2>
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onToggle={toggleCompliance}
                onRemove={removeProperty}
                onEpcOptimise={() => setEpcModalOpen(true)}
              />
            ))}
          </div>
        )}

        {properties.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Welcome!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Let's make your property management a little more peaceful. Start by adding your first home below.
            </p>
          </div>
        )}
      </div>

      <EpcOptimiserModal open={epcModalOpen} onClose={() => setEpcModalOpen(false)} />
      {scannerOpen && <DocumentScanner onClose={() => setScannerOpen(false)} />}
    </div>
  );
};

export default Index;
