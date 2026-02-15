import { useState } from "react";
import { Plus, Search, Flame, Zap, Droplet } from "lucide-react";
import type { HeatingType } from "@/types/property";

interface AddPropertyFormProps {
  onAdd: (address: string, heatingType: HeatingType) => void;
}

interface PostcodeResult {
  postcode: string;
  admin_district: string;
  parish: string;
  region: string;
}

const heatingOptions: { value: HeatingType; label: string; icon: typeof Flame }[] = [
  { value: "gas", label: "Gas", icon: Flame },
  { value: "electric", label: "Electric", icon: Zap },
  { value: "oil", label: "Oil", icon: Droplet },
];

const AddPropertyForm = ({ onAdd }: AddPropertyFormProps) => {
  const [postcode, setPostcode] = useState("");
  const [street, setStreet] = useState("");
  const [heatingType, setHeatingType] = useState<HeatingType>("gas");
  const [lookup, setLookup] = useState<PostcodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async () => {
    const trimmed = postcode.trim().replace(/\s+/g, "");
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setLookup(null);

    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (data.status !== 200 || !data.result) {
        setError("Postcode not found. Please check and try again.");
        return;
      }

      const r = data.result;
      setLookup({
        postcode: r.postcode,
        admin_district: r.admin_district || "",
        parish: r.parish || "",
        region: r.region || "",
      });
    } catch {
      setError("Unable to look up postcode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookup) return;
    const streetTrimmed = street.trim();
    const fullAddress = streetTrimmed
      ? `${streetTrimmed}, ${lookup.admin_district}, ${lookup.postcode}`
      : `${lookup.admin_district}, ${lookup.postcode}`;
    onAdd(fullAddress, heatingType);
    setPostcode("");
    setStreet("");
    setHeatingType("gas");
    setLookup(null);
    setError("");
  };

  const areaLabel = lookup
    ? [lookup.parish, lookup.admin_district, lookup.region]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <div className="space-y-3">
      {/* Postcode lookup row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={postcode}
          onChange={(e) => {
            setPostcode(e.target.value);
            setError("");
            if (lookup) setLookup(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleLookup();
            }
          }}
          placeholder="Enter postcode…"
          className="flex-1 rounded-[12px] border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
        />
        <button
          type="button"
          onClick={handleLookup}
          disabled={!postcode.trim() || loading}
          className="inline-flex items-center gap-1.5 rounded-[12px] bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {loading ? (
            <span className="landy-spinner" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Look up
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Show area result + street input + heating type */}
      {lookup && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-[12px] border border-border bg-muted/50 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Area found</p>
            <p className="text-sm text-foreground">{areaLabel}</p>
          </div>

          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Street address (e.g. 12 Elm Road)"
            autoFocus
            className="w-full rounded-[12px] border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
          />

          {/* Heating type selector */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Heating Type</p>
            <div className="grid grid-cols-3 gap-2">
              {heatingOptions.map(({ value, label, icon: HIcon }) => {
                const selected = heatingType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHeatingType(value)}
                    className="flex items-center justify-center gap-1.5 rounded-[12px] border-2 px-3 py-2 text-xs font-medium transition-all"
                    style={{
                      borderColor: selected ? "hsl(var(--hygge-sage))" : "hsl(var(--border))",
                      backgroundColor: selected ? "hsl(var(--hygge-sage) / 0.08)" : "transparent",
                      color: selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    <HIcon className="w-3.5 h-3.5" style={{ color: selected ? "hsl(var(--hygge-sage))" : "hsl(var(--muted-foreground))" }} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </form>
      )}
    </div>
  );
};

export default AddPropertyForm;
