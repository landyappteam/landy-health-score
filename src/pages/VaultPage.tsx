import DocumentVault from "@/components/DocumentVault";
import { useProperties } from "@/hooks/useProperties";

const VaultPage = () => {
  const { properties, documents, addDocument, removeDocument } = useProperties();

  return (
    <DocumentVault
      documents={documents}
      properties={properties.map((p) => ({ id: p.id, address: p.address }))}
      onAdd={addDocument}
      onRemove={removeDocument}
    />
  );
};

export default VaultPage;
