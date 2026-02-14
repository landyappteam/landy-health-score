import { useState } from "react";
import { Plus } from "lucide-react";

interface AddPropertyFormProps {
  onAdd: (address: string) => void;
}

const AddPropertyForm = ({ onAdd }: AddPropertyFormProps) => {
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setAddress("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter property address…"
        className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
      />
      <button
        type="submit"
        disabled={!address.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </form>
  );
};

export default AddPropertyForm;
