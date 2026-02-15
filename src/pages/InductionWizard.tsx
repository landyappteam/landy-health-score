import { useRef, useState } from "react";
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
  AlertCircle,
  ImageIcon,
  Sparkles,
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
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/welcome-hero.jpg";

/* ─── types ─── */
interface MeterReading {
  reading: string;
  photoUrl: string | null;
  uploading: boolean;
}

interface InductionData {
  gas: MeterReading;
  electric: MeterReading;
  water: MeterReading;
  gasNA: boolean;
  waterNA: boolean;
  gasSafetyNA: boolean;
  smokeAlarmsTested: boolean;
  carbonMonoxideTested: boolean;
  alarmTestPhotoUrl: string | null;
  alarmTestUploading: boolean;
  stopcockShown: boolean;
  epcReceived: boolean;
  gasSafetyReceived: boolean;
  eicrReceived: boolean;
  howToRentReceived: boolean;
  govInfoSheetReceived: boolean;
  tenantSignature: string | null;
}

/* ─── constants ─── */
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

const DOC_TOGGLES = [
  { key: "epcReceived" as const, label: "EPC provided" },
  { key: "gasSafetyReceived" as const, label: "Gas Safety Certificate provided" },
  { key: "eicrReceived" as const, label: "EICR provided" },
  { key: "howToRentReceived" as const, label: "How to Rent Guide provided" },
  { key: "govInfoSheetReceived" as const, label: "Government Information Sheet 2026 provided" },
];

const useUserTier = () => {
  const [tier] = useState<"free" | "pro">(() => {
    const stored = localStorage.getItem("landy-tier");
    return stored === "pro" ? "pro" : "free";
  });
  return tier;
};

/* ─── component ─── */
const InductionWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const propertyAddress = searchParams.get("address") || "Property";
  const { toast } = useToast();
  const tier = useUserTier();
  const isPro = tier === "pro";

  const fileInputRefs = {
    gas: useRef<HTMLInputElement>(null),
    electric: useRef<HTMLInputElement>(null),
    water: useRef<HTMLInputElement>(null),
    alarmTest: useRef<HTMLInputElement>(null),
  };

  const [step, setStep] = useState(0);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const [data, setData] = useState<InductionData>({
    gas: { reading: "", photoUrl: null, uploading: false },
    electric: { reading: "", photoUrl: null, uploading: false },
    water: { reading: "", photoUrl: null, uploading: false },
    gasNA: false,
    waterNA: false,
    gasSafetyNA: false,
    smokeAlarmsTested: false,
    carbonMonoxideTested: false,
    alarmTestPhotoUrl: null,
    alarmTestUploading: false,
    stopcockShown: false,
    epcReceived: false,
    gasSafetyReceived: false,
    eicrReceived: false,
    howToRentReceived: false,
    govInfoSheetReceived: false,
    tenantSignature: null,
  });

  /* ─── helpers ─── */
  const updateMeter = (
    meter: "gas" | "electric" | "water",
    updates: Partial<MeterReading>
  ) => {
    setData((prev) => ({
      ...prev,
      [meter]: { ...prev[meter], ...updates },
    }));
  };

  const handlePhotoUpload = async (
    meter: "gas" | "electric" | "water",
    file: File
  ) => {
    updateMeter(meter, { uploading: true });
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${propertyId || "unknown"}/${meter}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("meter-photos")
      .upload(path, file, { upsert: true });

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      updateMeter(meter, { uploading: false });
      return;
    }

    const { data: urlData } = supabase.storage
      .from("meter-photos")
      .getPublicUrl(path);

    updateMeter(meter, { photoUrl: urlData.publicUrl, uploading: false });
    toast({
      title: "Photo uploaded",
      description: `${meter.charAt(0).toUpperCase() + meter.slice(1)} meter photo saved.`,
    });
  };

  const handleAlarmPhotoUpload = async (file: File) => {
    setData((p) => ({ ...p, alarmTestUploading: true }));
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${propertyId || "unknown"}/alarm-test-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("meter-photos")
      .upload(path, file, { upsert: true });

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setData((p) => ({ ...p, alarmTestUploading: false }));
      return;
    }

    const { data: urlData } = supabase.storage
      .from("meter-photos")
      .getPublicUrl(path);

    setData((p) => ({ ...p, alarmTestPhotoUrl: urlData.publicUrl, alarmTestUploading: false }));
    toast({ title: "Photo uploaded", description: "Alarm test photo saved." });
  };

  const triggerFileInput = (key: "gas" | "electric" | "water" | "alarmTest") => {
    fileInputRefs[key].current?.click();
  };

  /* ─── validation ─── */
  const metersComplete =
    (data.gasNA || data.gas.reading.trim() !== "") &&
    data.electric.reading.trim() !== "" &&
    (data.waterNA || data.water.reading.trim() !== "");

  const docsComplete =
    data.epcReceived &&
    (data.gasSafetyNA || data.gasSafetyReceived) &&
    data.eicrReceived &&
    data.howToRentReceived &&
    data.govInfoSheetReceived;

  const canAdvanceTo = (targetStep: number): boolean => {
    if (targetStep <= 2) return true; // steps 0-2 always reachable
    // Step 3 (Completion) requires meters + docs
    return metersComplete && docsComplete;
  };

  const handleNext = () => {
    const target = step + 1;
    if (!canAdvanceTo(target)) {
      const missing: string[] = [];
      if (!metersComplete) missing.push("all meter readings");
      if (!docsComplete) missing.push("all document toggles");
      setValidationMsg(`Please complete ${missing.join(" and ")} before proceeding.`);
      return;
    }
    setValidationMsg(null);
    setStep(target);
  };

  /* ─── progress ─── */
  const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

  /* ─── save to Supabase ─── */
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!propertyId) {
      toast({ title: "Error", description: "No property selected.", variant: "destructive" });
      return;
    }

    setSaving(true);

    // Get current user (may be null if auth not yet implemented)
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    if (!userId) {
      // Fallback to localStorage if not authenticated
      const induction = {
        propertyId,
      gas_reading: data.gasNA ? "not_applicable" : data.gas.reading,
        electric_reading: data.electric.reading,
        water_reading: data.waterNA ? "not_applicable" : data.water.reading,
        gas_meter_photo_url: data.gas.photoUrl,
        electric_meter_photo_url: data.electric.photoUrl,
        water_meter_photo_url: data.water.photoUrl,
        smoke_alarm_photo_url: data.alarmTestPhotoUrl,
        smoke_alarms_tested: data.smokeAlarmsTested,
        stopcock_located: data.stopcockShown,
      gas_safety_received: data.gasSafetyNA ? false : data.gasSafetyReceived,
        epc_received: data.epcReceived,
        eicr_received: data.eicrReceived,
        how_to_rent_received: data.howToRentReceived,
        gov_info_sheet_received: data.govInfoSheetReceived,
        how_to_rent_2026_provided: data.howToRentReceived,
        gov_info_sheet_provided: data.govInfoSheetReceived,
        tenant_signature: data.tenantSignature,
        completed_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("landy-inductions") || "[]");
      localStorage.setItem("landy-inductions", JSON.stringify([...existing, induction]));
      toast({ title: "Induction saved locally", description: "Sign in to sync to the cloud." });
      setSaving(false);
      navigate("/");
      return;
    }

    const { error } = await supabase.from("inductions").insert({
      property_id: propertyId,
      user_id: userId,
      gas_reading: data.gasNA ? "not_applicable" : (data.gas.reading || null),
      electric_reading: data.electric.reading || null,
      water_reading: data.waterNA ? "not_applicable" : (data.water.reading || null),
      gas_meter_reading: data.gasNA ? "not_applicable" : (data.gas.reading || null),
      gas_meter_photo_url: data.gasNA ? null : data.gas.photoUrl,
      electric_meter_reading: data.electric.reading || null,
      electric_meter_photo_url: data.electric.photoUrl,
      water_meter_reading: data.waterNA ? "not_applicable" : (data.water.reading || null),
      water_meter_photo_url: data.waterNA ? null : data.water.photoUrl,
      smoke_alarm_photo_url: data.alarmTestPhotoUrl,
      smoke_alarms_tested: data.smokeAlarmsTested,
      stopcock_located: data.stopcockShown,
      gas_safety_received: data.gasSafetyNA ? false : data.gasSafetyReceived,
      epc_received: data.epcReceived,
      eicr_received: data.eicrReceived,
      how_to_rent_received: data.howToRentReceived,
      gov_info_sheet_received: data.govInfoSheetReceived,
      how_to_rent_2026_provided: data.howToRentReceived,
      gov_info_sheet_provided: data.govInfoSheetReceived,
      tenant_signature: data.tenantSignature,
      completed_at: new Date().toISOString(),
    } as any);

    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Induction complete ✓", description: "All details saved to your account." });
    navigate("/");
  };

  /* ─── PDF from induction_report_data view (Pro only) ─── */
  const handleGeneratePdf = async () => {
    if (!isPro) {
      setProModalOpen(true);
      return;
    }

    // Try fetching from the induction_report_data view for the latest saved induction
    const { data: reportRows } = await supabase
      .from("induction_report_data" as any)
      .select("*")
      .eq("property_address", propertyAddress)
      .order("completion_date", { ascending: false })
      .limit(1);

    const report = (reportRows as any)?.[0];

    generateHandoverPdf({
      propertyAddress: report?.property_address || propertyAddress,
      gas: { reading: report?.gas_reading || data.gas.reading, photoTaken: !!data.gas.photoUrl },
      electric: { reading: report?.electric_reading || data.electric.reading, photoTaken: !!data.electric.photoUrl },
      water: { reading: report?.water_reading || data.water.reading, photoTaken: !!data.water.photoUrl },
      smokeAlarmsTested: data.smokeAlarmsTested,
      carbonMonoxideTested: data.carbonMonoxideTested,
      stopcockShown: data.stopcockShown,
      gasSafetyReceived: data.gasSafetyReceived,
      epcReceived: data.epcReceived,
      eicrReceived: data.eicrReceived,
      govInfoSheetReceived: data.govInfoSheetReceived,
      tenantSignature: report?.tenant_signature || data.tenantSignature,
      completedAt: report?.completion_date || new Date().toISOString(),
    });
    toast({ title: "PDF generated", description: "Your signed certificate has been downloaded." });
  };

  const serifFont = { fontFamily: "Georgia, 'Times New Roman', serif" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--hygge-cream))" }}>
      <div className="mx-auto max-w-lg px-4 pb-12">
        {/* Hero */}
        <div className="relative -mx-4 mb-2">
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
            <h1 className="text-2xl font-semibold text-white tracking-tight" style={serifFont}>
              Welcome Your New Tenant
            </h1>
            <p className="text-white/80 text-sm mt-0.5 truncate">{propertyAddress}</p>
          </div>
        </div>

        {/* Hygge Progress Bar */}
        <div className="px-1 mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {STEPS.length} — {STEPS[step].label}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: "hsl(var(--hygge-sage))" }}
            >
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--border))" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "hsl(var(--hygge-sage))",
              }}
            />
          </div>
        </div>

        {/* Step labels */}
        <div className="flex items-center gap-1 mb-8 px-1">
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full h-1 rounded-full transition-colors"
                  style={{
                    backgroundColor:
                      done || active ? "hsl(var(--hygge-sage))" : "hsl(var(--border))",
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Validation message */}
        {validationMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 mb-5">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{validationMsg}</p>
          </div>
        )}

        {/* ─── Step 0: Utility Meters ─── */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Utility Meters
            </h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Record each meter reading and snap a photo for your records.
            </p>
            {METER_CONFIG.map(({ key, label, icon: Icon }) => {
              const isNA = key === "gas" ? data.gasNA : key === "water" ? data.waterNA : false;
              const hasNAOption = key === "gas" || key === "water";

              return (
                <div
                  key={key}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                    </div>
                    {hasNAOption && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${key}-na`} className="text-xs text-muted-foreground cursor-pointer">
                          N/A
                        </Label>
                        <Switch
                          id={`${key}-na`}
                          checked={isNA}
                          onCheckedChange={(v) => {
                            const naKey = key === "gas" ? "gasNA" : "waterNA";
                            setData((p) => ({ ...p, [naKey]: v }));
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {isNA ? (
                    <p className="text-xs text-muted-foreground italic">
                      {label} meter is not applicable for this property.
                    </p>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Enter reading…"
                          value={data[key].reading}
                          onChange={(e) => updateMeter(key, { reading: e.target.value })}
                          className="rounded-xl flex-1"
                        />
                        <input
                          ref={fileInputRefs[key]}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(key, file);
                          }}
                        />
                        <Button
                          variant="outline"
                          className="rounded-xl gap-1.5 shrink-0"
                          style={
                            data[key].photoUrl
                              ? {
                                  backgroundColor: "hsl(var(--hygge-sage))",
                                  color: "hsl(var(--hygge-sage-foreground))",
                                  borderColor: "hsl(var(--hygge-sage))",
                                }
                              : {}
                          }
                          disabled={data[key].uploading}
                          onClick={() => triggerFileInput(key)}
                        >
                          {data[key].uploading ? (
                            <span className="landy-spinner" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                          {data[key].photoUrl
                            ? "Done ✓"
                            : data[key].uploading
                            ? "Uploading…"
                            : "Snap Meter Photo"}
                        </Button>
                      </div>

                      {data[key].photoUrl && (
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          <a
                            href={data[key].photoUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary underline underline-offset-2 truncate"
                          >
                            View uploaded photo
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Step 1: Safety Checks ─── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Safety Checks
            </h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Confirm each safety item has been checked on the day of move-in.
            </p>

            {/* Smoke & CO Alarms */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}
                >
                  <AlertCircle className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />
                </div>
                <span className="text-sm font-semibold text-foreground">Smoke & CO Alarms</span>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="smokeAlarmsTested"
                    checked={data.smokeAlarmsTested}
                    onCheckedChange={(v) => setData((p) => ({ ...p, smokeAlarmsTested: !!v }))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="smokeAlarmsTested" className="text-sm cursor-pointer leading-snug">
                    Smoke Alarms Tested (Date of Move-in)
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="carbonMonoxideTested"
                    checked={data.carbonMonoxideTested}
                    onCheckedChange={(v) => setData((p) => ({ ...p, carbonMonoxideTested: !!v }))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="carbonMonoxideTested" className="text-sm cursor-pointer leading-snug">
                    Carbon Monoxide Alarms Tested
                  </Label>
                </div>
              </div>

              {/* Take Photo of Alarm Test */}
              <div className="pt-1">
                <input
                  ref={fileInputRefs.alarmTest}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAlarmPhotoUpload(file);
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2"
                  style={
                    data.alarmTestPhotoUrl
                      ? {
                          backgroundColor: "hsl(var(--hygge-sage))",
                          color: "hsl(var(--hygge-sage-foreground))",
                          borderColor: "hsl(var(--hygge-sage))",
                        }
                      : {}
                  }
                  disabled={data.alarmTestUploading}
                  onClick={() => triggerFileInput("alarmTest")}
                >
                  {data.alarmTestUploading ? (
                    <span className="landy-spinner" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  {data.alarmTestPhotoUrl
                    ? "Alarm Test Photo Captured ✓"
                    : data.alarmTestUploading
                    ? "Uploading…"
                    : "Take Photo of Alarm Test"}
                </Button>
                {data.alarmTestPhotoUrl && (
                  <div className="flex items-center gap-2 mt-2">
                    <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <a
                      href={data.alarmTestPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline underline-offset-2 truncate"
                    >
                      View alarm test photo
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stopcock */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="stopcockShown"
                  checked={data.stopcockShown}
                  onCheckedChange={(v) => setData((p) => ({ ...p, stopcockShown: !!v }))}
                  className="mt-0.5"
                />
                <Label htmlFor="stopcockShown" className="text-sm cursor-pointer leading-snug">
                  Water Stopcock Location Shown
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Documents ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Documents Provided
            </h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Toggle each document the tenant has received.
            </p>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm divide-y divide-border">
              {DOC_TOGGLES.map(({ key, label }) => {
                const isGasSafety = key === "gasSafetyReceived";
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                  >
                    <Label htmlFor={key} className={`text-sm cursor-pointer flex-1 pr-4 ${isGasSafety && data.gasSafetyNA ? "line-through text-muted-foreground" : ""}`}>
                      {label}{isGasSafety && data.gasSafetyNA ? " (N/A)" : ""}
                    </Label>
                    <div className="flex items-center gap-2">
                      {isGasSafety && (
                        <>
                          <Label htmlFor="gasSafety-na" className="text-xs text-muted-foreground cursor-pointer">
                            N/A
                          </Label>
                          <Switch
                            id="gasSafety-na"
                            checked={data.gasSafetyNA}
                            onCheckedChange={(v) => setData((p) => ({ ...p, gasSafetyNA: v }))}
                          />
                        </>
                      )}
                      {!(isGasSafety && data.gasSafetyNA) && (
                        <Switch
                          id={key}
                          checked={data[key]}
                          onCheckedChange={(v) => setData((p) => ({ ...p, [key]: v }))}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline validation hint */}
            {!docsComplete && (
              <p className="text-xs text-muted-foreground italic px-1">
                All documents must be toggled on before you can proceed to Completion.
              </p>
            )}
          </div>
        )}

        {/* ─── Step 3: Completion ─── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>
              Completion
            </h2>
            <p className="text-sm text-muted-foreground -mt-4">
              {isPro
                ? "Capture the tenant's signature and generate your signed certificate."
                : "Your checklist and readings are saved. Upgrade to Pro for digital signatures and certificates."}
            </p>

            {/* Signature Pad — Pro only */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground" style={serifFont}>
                  Digital Signature
                </h3>
                {!isPro && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "hsl(var(--hygge-sage) / 0.15)",
                      color: "hsl(var(--hygge-sage))",
                    }}
                  >
                    <Sparkles className="w-3 h-3" /> PRO
                  </span>
                )}
              </div>

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
                    <p className="text-sm font-medium text-foreground text-center max-w-[260px] leading-snug">
                      A digital signature creates a legally-binding evidence trail
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
              )}
            </div>

            {/* Generate Signed Certificate */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-base font-semibold text-foreground" style={serifFont}>
                Signed Certificate
              </h3>
              {isPro ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Generate a timestamped PDF with all meter photos, readings, document confirmations, and the tenant's signature.
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
                    Generate Signed Certificate
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="rounded-xl p-4 space-y-2"
                    style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.08)" }}
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold">Did you know?</span> From 2026,
                      landlords without proper handover documentation face fines up to{" "}
                      <span className="font-semibold">£7,000</span>.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      A signed, timestamped certificate is the simplest way to protect yourself.
                      Landy Pro generates one in a single tap — with all your photos, readings,
                      and the tenant's digital signature included.
                    </p>
                  </div>
                  <button
                    onClick={() => setProModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "hsl(var(--hygge-sage))",
                      color: "hsl(var(--hygge-sage-foreground))",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to unlock certificates
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12"
              onClick={() => {
                setValidationMsg(null);
                setStep((s) => s - 1);
              }}
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
              onClick={handleNext}
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl h-12 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "hsl(var(--hygge-sage))",
                color: "hsl(var(--hygge-sage-foreground))",
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <span className="landy-spinner" /> : <Check className="w-4 h-4" />}
              {saving ? "Saving…" : "Save & Finish"}
            </button>
          )}
        </div>
      </div>

      <ProUpsellModal open={proModalOpen} onClose={() => setProModalOpen(false)} />
    </div>
  );
};

export default InductionWizard;
