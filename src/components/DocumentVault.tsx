import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { VaultDocument } from "@/types/property";

interface DocumentVaultProps {
  documents: VaultDocument[];
  properties: { id: string; address: string }[];
  onAdd: (doc: Omit<VaultDocument, "id" | "addedAt">) => void;
  onRemove: (docId: string) => void;
}

const docTypes: { value: VaultDocument["type"]; label: string }[] = [
  { value: "gas", label: "Gas Safety" },
  { value: "eicr", label: "EICR" },
  { value: "epc", label: "EPC" },
  { value: "tenant-info", label: "Tenant Info Statement" },
  { value: "other", label: "Other" },
];

const DocumentVault = ({ documents, properties, onAdd, onRemove }: DocumentVaultProps) => {
  const handleAddDocument = () => {
    if (properties.length === 0) return;
    const name = prompt("Certificate name (e.g. 'Gas Safety 2025.pdf'):");
    if (!name?.trim()) return;

    // Simple selection for property and type
    const propertyId = properties.length === 1
      ? properties[0].id
      : (() => {
          const idx = prompt(
            properties.map((p, i) => `${i + 1}. ${p.address}`).join("\n") + "\n\nEnter property number:"
          );
          const i = parseInt(idx || "1", 10) - 1;
          return properties[Math.max(0, Math.min(i, properties.length - 1))].id;
        })();

    onAdd({ propertyId, name: name.trim(), type: "other" });
  };

  const getPropertyAddress = (propertyId: string) =>
    properties.find((p) => p.id === propertyId)?.address ?? "Unknown";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-8">
        <header className="flex items-center gap-3 pt-6 pb-4">
          <Link
            to="/"
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Document Vault</h1>
        </header>

        <button
          onClick={handleAddDocument}
          disabled={properties.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40 transition-colors mb-5"
        >
          <Plus className="w-4 h-4" />
          Add Certificate
        </button>

        {properties.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Add a property first to upload certificates.
          </p>
        )}

        {documents.length === 0 && properties.length > 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              No certificates uploaded yet.
            </p>
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getPropertyAddress(doc.propertyId)} · {new Date(doc.addedAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(doc.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVault;
