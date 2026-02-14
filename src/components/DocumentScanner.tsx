import { useState, useRef } from "react";
import { Camera, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScanResult {
  documentType: "gas" | "eicr" | "epc" | "other";
  expiryDate: string | null;
  allDatesFound: string[];
  confidence: "high" | "medium" | "low";
}

const DOC_TYPE_LABELS: Record<string, string> = {
  gas: "Gas Safety Certificate",
  eicr: "EICR Certificate",
  epc: "EPC Certificate",
  other: "Document",
};

interface Props {
  onClose: () => void;
  onResult?: (result: ScanResult) => void;
}

const DocumentScanner = ({ onClose, onResult }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 4MB for base64 → ~5.3MB)
    if (file.size > 4 * 1024 * 1024) {
      setError("Image too large. Please use a photo under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!preview) return;
    setScanning(true);
    setError("");

    try {
      // Extract base64 from data URL
      const base64 = preview.split(",")[1];

      const { data, error: fnError } = await supabase.functions.invoke("scan-document", {
        body: { imageBase64: base64 },
      });

      if (fnError) throw new Error(fnError.message);

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data as ScanResult);
      onResult?.(data as ScanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan document");
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Document Scanner</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera input */}
          {!preview && (
            <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 py-12 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Take a photo or choose image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gas Safety, EICR, or EPC certificate
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                className="sr-only"
              />
            </label>
          )}

          {/* Preview */}
          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={preview} alt="Captured document" className="w-full object-contain max-h-64" />
              {!scanning && !result && (
                <button
                  onClick={reset}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-card transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Scan button */}
          {preview && !result && (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning for dates…
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Scan Document
                </>
              )}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">Scan Complete</span>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      result.confidence === "high"
                        ? "hsl(var(--primary) / 0.12)"
                        : result.confidence === "medium"
                        ? "hsl(var(--risk-warm) / 0.12)"
                        : "hsl(var(--muted))",
                    color:
                      result.confidence === "high"
                        ? "hsl(var(--primary))"
                        : result.confidence === "medium"
                        ? "hsl(var(--risk-warm))"
                        : "hsl(var(--muted-foreground))",
                  }}
                >
                  {result.confidence} confidence
                </span>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 divide-y divide-border">
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">Document type</p>
                  <p className="text-sm font-medium text-foreground">
                    {DOC_TYPE_LABELS[result.documentType] || result.documentType}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">Suggested expiry date</p>
                  <p className="text-sm font-medium text-foreground">
                    {result.expiryDate || "No date found"}
                  </p>
                </div>
                {result.allDatesFound.length > 0 && (
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">All dates found</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.allDatesFound.map((d, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-md bg-card border border-border text-foreground"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Scan Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner;
