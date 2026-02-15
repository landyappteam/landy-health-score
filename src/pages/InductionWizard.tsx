import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Camera, Gauge, FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SignaturePad from "@/components/SignaturePad";
import { useToast } from "@/hooks/use-toast";

interface MeterReading {
  reading: string;
  photoTaken: boolean;
}

interface InductionData {
  gas: MeterReading;
  electric: MeterReading;
  water: MeterReading;
  smokeAlarmsTested: boolean;
  stopcockLocated: boolean;
  gasSafetyReceived: boolean;
  epcReceived: boolean;
  eicrReceived: boolean;
  howToRentReceived: boolean;
  govInfoSheetReceived: boolean;
  tenantSignature: string | null;
}

const STEPS = [
  { label: "Physical", icon: Gauge },
  { label: "Documents", icon: FileText },
  { label: "Sign-off", icon: PenLine },
];

const InductionWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const propertyAddress = searchParams.get("address") || "Property";
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<InductionData>({
    gas: { reading: "", photoTaken: false },
    electric: { reading: "", photoTaken: false },
    water: { reading: "", photoTaken: false },
    smokeAlarmsTested: false,
    stopcockLocated: false,
    gasSafetyReceived: false,
    epcReceived: false,
    eicrReceived: false,
    howToRentReceived: false,
    govInfoSheetReceived: false,
    tenantSignature: null,
  });

  const updateMeter = (meter: "gas" | "electric" | "water", field: keyof MeterReading, value: string | boolean) => {
    setData((prev) => ({ ...prev, [meter]: { ...prev[meter], [field]: value } }));
  };

  const handlePhotoStub = (meter: "gas" | "electric" | "water") => {
    updateMeter(meter, "photoTaken", true);
    toast({ title: "Photo captured", description: `${meter.charAt(0).toUpperCase() + meter.slice(1)} meter photo saved.` });
  };

  const handleSubmit = () => {
    // Save to localStorage for now (Supabase requires auth)
    const induction = {
      id: crypto.randomUUID(),
      propertyId,
      ...data,
      completedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("landy-inductions") || "[]");
    localStorage.setItem("landy-inductions", JSON.stringify([...existing, induction]));
    toast({ title: "Induction complete ✓", description: "All details have been saved." });
    navigate("/");
  };

  const canProceed = () => {
    if (step === 2) return !!data.tenantSignature;
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-10">
        {/* Header */}
        <header className="flex items-center gap-3 pt-6 pb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Tenant Induction</h1>
            <p className="text-sm text-muted-foreground truncate max-w-[260px]">{propertyAddress}</p>
          </div>
        </header>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.label} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                      ? "bg-primary/15 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${active ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          {step === 0 && (
            <>
              <h2 className="text-base font-semibold text-foreground">Meter Readings & Safety Checks</h2>

              {(["gas", "electric", "water"] as const).map((meter) => (
                <div key={meter} className="space-y-2">
                  <Label className="capitalize text-sm font-medium">{meter} Meter</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`${meter} reading…`}
                      value={data[meter].reading}
                      onChange={(e) => updateMeter(meter, "reading", e.target.value)}
                      className="rounded-xl"
                    />
                    <Button
                      variant={data[meter].photoTaken ? "default" : "outline"}
                      size="icon"
                      className="rounded-xl shrink-0"
                      onClick={() => handlePhotoStub(meter)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  {data[meter].photoTaken && (
                    <p className="text-xs text-primary font-medium">✓ Photo captured</p>
                  )}
                </div>
              ))}

              <div className="pt-2 space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="smoke"
                    checked={data.smokeAlarmsTested}
                    onCheckedChange={(v) => setData((p) => ({ ...p, smokeAlarmsTested: !!v }))}
                  />
                  <Label htmlFor="smoke" className="text-sm cursor-pointer">Smoke Alarms Tested</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="stopcock"
                    checked={data.stopcockLocated}
                    onCheckedChange={(v) => setData((p) => ({ ...p, stopcockLocated: !!v }))}
                  />
                  <Label htmlFor="stopcock" className="text-sm cursor-pointer">Stopcock Located</Label>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-base font-semibold text-foreground">Mandatory Documents</h2>
              <p className="text-sm text-muted-foreground">Confirm the tenant has received each document.</p>

              {([
                { key: "gasSafetyReceived", label: "Gas Safety Certificate" },
                { key: "epcReceived", label: "Energy Performance Certificate (EPC)" },
                { key: "eicrReceived", label: "EICR Certificate" },
                { key: "howToRentReceived", label: "How to Rent 2026" },
                { key: "govInfoSheetReceived", label: "Government Information Sheet" },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <Label htmlFor={key} className="text-sm cursor-pointer flex-1">{label}</Label>
                  <Switch
                    id={key}
                    checked={data[key]}
                    onCheckedChange={(v) => setData((p) => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-base font-semibold text-foreground">Tenant Sign-off</h2>
              <p className="text-sm text-muted-foreground">
                Ask the tenant to sign below to confirm the induction is complete.
              </p>
              <SignaturePad onSignatureChange={(sig) => setData((p) => ({ ...p, tenantSignature: sig }))} />
            </>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < 2 ? (
            <Button className="flex-1 rounded-xl" onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button className="flex-1 rounded-xl" onClick={handleSubmit} disabled={!canProceed()}>
              <Check className="w-4 h-4 mr-1" /> Complete Induction
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InductionWizard;
