import { useState, useEffect, useRef } from "react";
import { Camera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MeterCardInputProps {
  meterKey: "gas" | "electric" | "water" | "oil";
  label: string;
  icon: React.ElementType;
  reading: string;
  photoUrl: string | null;
  uploading: boolean;
  isWaterNA?: boolean;
  onWaterNAChange?: (v: boolean) => void;
  onReadingChange: (value: string) => void;
  onTriggerPhoto: () => void;
}

const MeterCardInput = ({
  meterKey,
  label,
  icon: Icon,
  reading,
  photoUrl,
  uploading,
  isWaterNA = false,
  onWaterNAChange,
  onReadingChange,
  onTriggerPhoto,
}: MeterCardInputProps) => {
  // Local state to prevent parent re-renders from stealing focus
  const [localValue, setLocalValue] = useState(reading);
  const isTypingRef = useRef(false);

  // Sync from parent when not actively typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setLocalValue(reading);
    }
  }, [reading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    setLocalValue(e.target.value);
    onReadingChange(e.target.value);
  };

  const handleBlur = () => {
    isTypingRef.current = false;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        {meterKey === "water" && onWaterNAChange && (
          <div className="flex items-center gap-2">
            <Label htmlFor="water-na" className="text-xs text-muted-foreground cursor-pointer">N/A</Label>
            <Switch id="water-na" checked={isWaterNA} onCheckedChange={onWaterNAChange} />
          </div>
        )}
      </div>
      {isWaterNA ? (
        <p className="text-xs text-muted-foreground italic">Water meter not applicable.</p>
      ) : (
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter reading…"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className="rounded-xl flex-1"
          />
          <Button variant="outline" className="rounded-xl gap-1.5 shrink-0"
            style={photoUrl ? { backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))", borderColor: "hsl(var(--hygge-sage))" } : {}}
            disabled={uploading} onClick={onTriggerPhoto}>
            {uploading ? <span className="landy-spinner" /> : <Camera className="w-4 h-4" />}
            {photoUrl ? "Done ✓" : uploading ? "Uploading…" : "Photo"}
          </Button>
        </div>
      )}
      {!isWaterNA && photoUrl && (
        <div className="flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
          <a href={photoUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-primary underline underline-offset-2 truncate">View photo</a>
        </div>
      )}
    </div>
  );
};

export default MeterCardInput;
