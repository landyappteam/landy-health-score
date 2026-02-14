import { useState } from "react";
import { Home, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import ComplianceScore from "@/components/ComplianceScore";
import PropertyCard from "@/components/PropertyCard";
import AddPropertyForm from "@/components/AddPropertyForm";
import EpcOptimiserModal from "@/components/EpcOptimiserModal";
import { useProperties } from "@/hooks/useProperties";

const Index = () => {
  const { properties, addProperty, toggleCompliance, removeProperty, healthScore } =
    useProperties();
  const [epcModalOpen, setEpcModalOpen] = useState(false);

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
          <Link
            to="/vault"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Vault
          </Link>
        </header>

        {/* Score */}
        <ComplianceScore score={healthScore} propertyCount={properties.length} />

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
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Add your first property to begin tracking compliance.
            </p>
          </div>
        )}
      </div>

      <EpcOptimiserModal open={epcModalOpen} onClose={() => setEpcModalOpen(false)} />
    </div>
  );
};

export default Index;
