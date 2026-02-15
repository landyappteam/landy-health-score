import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  Gauge,
  FileText,
  PenLine,
  Flame,
  Zap,
  Droplets,
  Lock,
  Download,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SignaturePad from "@/components/SignaturePad";
import ProUpsellModal from "@/components/ProUpsellModal";
import { useToast } from "@/hooks/use-toast";
import { generateHandoverPdf } from "@/lib/generateHandoverPdf";
import heroImg from "@/assets/welcome-hero.jpg";

interface MeterReading {
  reading: string;
  photoTaken: boolean;
}

interface InductionData {
  gas: MeterReading;
  electric: MeterReading;
  water: MeterReading;
  smokeAlarmsTested: boolean;
  carbonMonoxideTested: boolean;
  stopcockShown: boolean;
  gasSafetyReceived: boolean;
  epcReceived: boolean;
  eicrReceived: boolean;
  govInfoSheetReceived: boolean;
  tenantSignature: string | null;
}

const STEPS = [
  { label: "Meters", icon: Gauge },
  { label: "Safety", icon: FileText },
  { label: "Documents", icon: PenLine },
  { label: "Completion", icon: PartyPopper },
];

const METER_CONFIG = [
  { key: "gas" as const, label: "Gas", icon: Flame },
  { key: "electric" as const, label: "Electric", icon: Zap },
  { key: "water" as const, label: "Water", icon: Droplets },
];

// Simulated tier — in production this would come from the profiles table
const useUserTier = () => {
  const [tier] = useState<"free" | "pro">(() => {
    const stored = localStorage.getItem("landy-tier");
    return stored === "pro" ? "pro" : "free";
  });
  return tier;
};

const InductionWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const propertyAddress = searchParams.get("address") || "Property";
  const { toast } = useToast();
  const tier = useUserTier();
  const isPro = tier === "pro";

  const [step, setStep] = useState(0);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [data, setData] = useState<InductionData>({
    gas: { reading: "", photoTaken: false },
    electric: { reading: "", photoTaken: false },
    water: { reading: "", photoTaken: false },
    smokeAlarmsTested: false,
    carbonMonoxideTested: false,
    stopcockShown: false,
    gasSafetyReceived: false,
    epcReceived: false,
    eicrReceived: false,
    govInfoSheetReceived: false,
    tenantSignature: null,
  });

  const updateMeter = (
    meter: "gas" | "electric" | "water",
    field: keyof MeterReading,
    value: string | boolean
  ) => {
    setData((prev) => ({
      ...prev,
      [meter]: { ...prev[meter], [field]: value },
    }));
  };

  const handlePhotoStub = (meter: "gas" | "electric" | "water") => {
    updateMeter(meter, "photoTaken", true);
    toast({
      title: "Photo captured",
      description: `${meter.charAt(0).toUpperCase() + meter.slice(1)} meter photo saved.`,
    });
  };

  const handleSave = () => {
    const induction = {
      id: crypto.randomUUID(),
      propertyId,
      ...data,
      completedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(
      localStorage.getItem("landy-inductions") || "[]"
    );
    localStorage.setItem(
      "landy-inductions",
      JSON.stringify([...existing, induction])
    );
    toast({
      title: "Induction complete ✓",
      description: "All details have been saved.",
    });
    navigate("/");
  };

  const handleGeneratePdf = () => {
    if (!isPro) {
      setProModalOpen(true);
      return;
    }
    generateHandoverPdf({
      propertyAddress,
      ...data,
      completedAt: new Date().toISOString(),
    });
    toast({ title: "PDF generated", description: "Your handover certificate has been downloaded." });
  };

  const serifFont = { fontFamily: "Georgia, 'Times New Roman', serif" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--hygge-cream))" }}>
      <div className="mx-auto max-w-lg px-4 pb-12">
        {/* Hero */}
        <div className="relative -mx-4 mb-8">
          <img
            src={heroImg}
            alt="A key resting on a wooden table"
            className="w-full h-52 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur text-foreground hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <h1
              className="text-2xl font-semibold text-white tracking-tight"
              style={serifFont}
            >
              Welcome Your New Tenant
            </h1>
            <p className="text-white/80 text-sm mt-0.5 truncate">
              {propertyAddress}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8 px-1">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full h-1.5 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      done || active
                        ? "hsl(var(--hygge-sage))"
                        : "hsl(var(--border))",
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color: active
                      ? "hsl(var(--foreground))"
                      : "hsl(var(--muted-foreground))",
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step 0: Utility Meters */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Utility Meters
            </h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Record each meter reading and snap a photo for your records.
            </p>
            {METER_CONFIG.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter reading…"
                    value={data[key].reading}
                    onChange={(e) => updateMeter(key, "reading", e.target.value)}
                    className="rounded-xl flex-1"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl gap-1.5 shrink-0"
                    style={
                      data[key].photoTaken
                        ? {
                            backgroundColor: "hsl(var(--hygge-sage))",
                            color: "hsl(var(--hygge-sage-foreground))",
                            borderColor: "hsl(var(--hygge-sage))",
                          }
                        : {}
                    }
                    onClick={() => handlePhotoStub(key)}
                  >
                    <Camera className="w-4 h-4" />
                    {data[key].photoTaken ? "Done" : "Add Photo"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Safety Checks */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Safety Checks
            </h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Confirm each safety item has been checked on the day of move-in.
            </p>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
              {[
                { id: "smokeAlarmsTested", label: "Smoke Alarms Tested (Date of Move-in)", checked: data.smokeAlarmsTested },
                { id: "carbonMonoxideTested", label: "Carbon Monoxide Alarms Tested", checked: data.carbonMonoxideTested },
                { id: "stopcockShown", label: "Water Stopcock Location Shown", checked: data.stopcockShown },
              ].map(({ id, label, checked }) => (
                <div key={id} className="flex items-start gap-3">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(v) => setData((p) => ({ ...p, [id]: !!v }))}
                    className="mt-0.5"
                  />
                  <Label htmlFor={id} className="text-sm cursor-pointer leading-snug">{label}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Documents Provided
            </h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Toggle each document the tenant has received.
            </p>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm divide-y divide-border">
              {[
                { key: "epcReceived", label: "EPC provided" },
                { key: "gasSafetyReceived", label: "Gas Safety Certificate provided" },
                { key: "eicrReceived", label: "EICR provided" },
                { key: "govInfoSheetReceived", label: "2026 Government Information Sheet provided" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <Label htmlFor={key} className="text-sm cursor-pointer flex-1 pr-4">{label}</Label>
                  <Switch
                    id={key}
                    checked={(data as any)[key]}
                    onCheckedChange={(v) => setData((p) => ({ ...p, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Completion */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Completion
            </h2>
            <p className="text-sm text-muted-foreground -mt-4">
              Capture the tenant's signature and generate the handover certificate.
            </p>

            {/* Signature Pad — Pro gated */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3 relative">
              <h3 className="text-base font-semibold text-foreground" style={serifFont}>
                Tenant Signature
              </h3>

              {isPro ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Ask the tenant to sign below to confirm the walkthrough.
                  </p>
                  <SignaturePad
                    onSignatureChange={(sig) =>
                      setData((p) => ({ ...p, tenantSignature: sig }))
                    }
                  />
                </>
              ) : (
                <>
                  {/* Blurred signature area */}
                  <div className="relative">
                    <div className="blur-[6px] pointer-events-none select-none opacity-60">
                      <div className="rounded-xl border-2 border-dashed border-border h-40 flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Sign here</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-2xl"
                        style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}
                      >
                        <Lock className="w-5 h-5" style={{ color: "hsl(var(--hygge-sage))" }} />
                      </div>
                      <p className="text-sm font-medium text-foreground text-center max-w-[240px]">
                        Digital signatures are a Pro feature
                      </p>
                      <button
                        onClick={() => setProModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "hsl(var(--hygge-sage))",
                          color: "hsl(var(--hygge-sage-foreground))",
                        }}
                      >
                        Unlock with Landy Pro
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Generate PDF */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-base font-semibold text-foreground" style={serifFont}>
                Handover Certificate
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate a professional PDF with all readings, photos, and the tenant signature.
              </p>
              <button
                onClick={handleGeneratePdf}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "hsl(var(--hygge-sage))",
                  color: "hsl(var(--hygge-sage-foreground))",
                }}
              >
                <Download className="w-4 h-4" />
                Generate Handover Certificate
                {!isPro && <Lock className="w-3.5 h-3.5 ml-0.5 opacity-70" />}
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          )}
          {step < 3 ? (
            <button
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl h-12 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "hsl(var(--hygge-sage))",
                color: "hsl(var(--hygge-sage-foreground))",
              }}
              onClick={() => setStep((s) => s + 1)}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl h-12 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "hsl(var(--hygge-sage))",
                color: "hsl(var(--hygge-sage-foreground))",
              }}
              onClick={handleSave}
            >
              <Check className="w-4 h-4" /> Save & Finish
            </button>
          )}
        </div>
      </div>

      <ProUpsellModal open={proModalOpen} onClose={() => setProModalOpen(false)} />
    </div>
  );
};

export default InductionWizard;
