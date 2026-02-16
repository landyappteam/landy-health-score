import { useEffect, useRef, useState } from "react";
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
  Home,
  Building2,
  Users,
  DoorOpen,
  Radio,
  ArrowUpDown,
  ShieldCheck,
  FireExtinguisher,
  LogOut,
  Droplet,
  Eye,
  Shield,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import SignaturePad from "@/components/SignaturePad";
import MeterCardInput from "@/components/MeterCardInput";
import ProUpsellModal from "@/components/ProUpsellModal";
import { useToast } from "@/hooks/use-toast";
import { generateHandoverPdf } from "@/lib/generateHandoverPdf";
import { supabase } from "@/integrations/supabase/client";
import { useUserTier } from "@/hooks/useUserTier";
import heroImg from "@/assets/welcome-hero.jpg";

/* ─── types ─── */
type PropertyType = "house" | "flat" | "hmo" | null;

interface MeterReading {
  reading: string;
  photoUrl: string | null;
  uploading: boolean;
}

interface InductionData {
  propertyType: PropertyType;
  hasGas: boolean;
  hasOil: boolean;
  gas: MeterReading;
  electric: MeterReading;
  water: MeterReading;
  waterNA: boolean;
  // Oil heating
  oilLevel: string;
  oilTankNoCracks: boolean;
  oilBaseStable: boolean;
  oilPhotoUrl: string | null;
  oilPhotoUploading: boolean;
  // Section N/A flags
  utilityNA: boolean;
  legalNA: boolean;
  buildingNA: boolean;
  // Individual safety N/A flags
  windowRestrictorsNA: boolean;
  stopcockNA: boolean;
  // Safety & Condition
  smokeAlarmsTested: boolean;
  carbonMonoxideTested: boolean;
  alarmTestPhotoUrl: string | null;
  alarmTestUploading: boolean;
  stopcockShown: boolean;
  dampMouldCheck: boolean;
  windowRestrictors: boolean;
  // Legal Paperwork
  epcReceived: boolean;
  gasSafetyReceived: boolean;
  eicrReceived: boolean;
  howToRentReceived: boolean;
  govInfoSheetReceived: boolean;
  // Building Specifics (Flat/HMO)
  fireDoors: boolean;
  communalAreas: boolean;
  intercom: boolean;
  liftAccess: boolean;
  hmoLicense: boolean;
  fireExtinguishers: boolean;
  fireExitSignage: boolean;
  tenantSignature: string | null;
}

/* ─── constants ─── */
const STEPS = [
  { label: "Profile", icon: Home },
  { label: "Evidence", icon: Gauge },
  { label: "Paperwork", icon: FileText },
  { label: "Safety", icon: Shield },
  { label: "Summary", icon: PartyPopper },
];

/* ─── reusable N/A link ─── */
const NALink = ({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="text-[11px] font-medium transition-colors"
    style={{ color: active ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}
  >
    {active ? "↩ Re-enable" : "Mark N/A"}
  </button>
);

/* ─── section card wrapper ─── */
const SectionCard = ({
  title,
  icon: Icon,
  naActive = false,
  onToggleNA,
  children,
}: {
  title: string;
  icon: React.ElementType;
  naActive?: boolean;
  onToggleNA?: () => void;
  children: React.ReactNode;
}) => (
  <div
    className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 transition-opacity"
    style={{ opacity: naActive ? 0.45 : 1 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}
        >
          <Icon className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {onToggleNA && <NALink active={naActive} onToggle={onToggleNA} />}
    </div>
    {naActive ? (
      <p className="text-xs text-muted-foreground italic">
        This section has been marked as Not Applicable.
      </p>
    ) : (
      children
    )}
  </div>
);

/* ─── component ─── */
const InductionWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const propertyAddress = searchParams.get("address") || "Property";
  const heatingParam = searchParams.get("heating") as "gas" | "electric" | "oil" | null;
  const { toast } = useToast();
  const { tier } = useUserTier();
  const isPro = tier === "pro";

  const fileInputRefs = {
    gas: useRef<HTMLInputElement>(null),
    electric: useRef<HTMLInputElement>(null),
    water: useRef<HTMLInputElement>(null),
    alarmTest: useRef<HTMLInputElement>(null),
    oilTank: useRef<HTMLInputElement>(null),
  };

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  const [data, setData] = useState<InductionData>(() => ({
    propertyType: null,
    hasGas: heatingParam === "gas" || !heatingParam,
    hasOil: heatingParam === "oil",
    gas: { reading: "", photoUrl: null, uploading: false },
    electric: { reading: "", photoUrl: null, uploading: false },
    water: { reading: "", photoUrl: null, uploading: false },
    waterNA: false,
    oilLevel: "",
    oilTankNoCracks: false,
    oilBaseStable: false,
    oilPhotoUrl: null,
    oilPhotoUploading: false,
    utilityNA: false,
    legalNA: false,
    buildingNA: false,
    windowRestrictorsNA: false,
    stopcockNA: false,
    smokeAlarmsTested: false,
    carbonMonoxideTested: false,
    alarmTestPhotoUrl: null,
    alarmTestUploading: false,
    stopcockShown: false,
    dampMouldCheck: false,
    windowRestrictors: false,
    epcReceived: false,
    gasSafetyReceived: false,
    eicrReceived: false,
    howToRentReceived: false,
    govInfoSheetReceived: false,
    fireDoors: false,
    communalAreas: false,
    intercom: false,
    liftAccess: false,
    hmoLicense: false,
    fireExtinguishers: false,
    fireExitSignage: false,
    tenantSignature: null,
  }));

  // Friendly fallback if no property selected (after all hooks)
  if (!propertyId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-[12px] border border-border bg-card p-7 text-center space-y-4 shadow-md">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-[12px]"
            style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}>
            <AlertCircle className="w-7 h-7" style={{ color: "hsl(var(--hygge-sage))" }} />
          </div>
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Oops, we lost track
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We lost track of which property this is for. Please head back to the dashboard and try again.
          </p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] h-11 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))" }}
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const noGas = !data.hasGas || data.hasOil;
  const hasOil = data.hasOil;
  const isFlat = data.propertyType === "flat";
  const isHmo = data.propertyType === "hmo";
  const showBuilding = isFlat || isHmo;

  /* ─── helpers ─── */
  const updateMeter = (meter: "gas" | "electric" | "water", updates: Partial<MeterReading>) => {
    setData((prev) => ({ ...prev, [meter]: { ...prev[meter], ...updates } }));
  };

  const handlePhotoUpload = async (meter: "gas" | "electric" | "water", file: File) => {
    updateMeter(meter, { uploading: true });
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData?.user?.id;
    if (!uid) {
      toast({ title: "Upload failed", description: "You must be signed in to upload photos.", variant: "destructive" });
      updateMeter(meter, { uploading: false });
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${uid}/${propertyId}/${meter}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("meter-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      updateMeter(meter, { uploading: false });
      return;
    }
    const { data: urlData } = await supabase.storage.from("meter-photos").createSignedUrl(path, 3600);
    updateMeter(meter, { photoUrl: urlData?.signedUrl || null, uploading: false });
    toast({ title: "Photo uploaded", description: `${meter.charAt(0).toUpperCase() + meter.slice(1)} meter photo saved.` });
  };

  const handleAlarmPhotoUpload = async (file: File) => {
    setData((p) => ({ ...p, alarmTestUploading: true }));
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData?.user?.id;
    if (!uid) {
      toast({ title: "Upload failed", description: "You must be signed in.", variant: "destructive" });
      setData((p) => ({ ...p, alarmTestUploading: false }));
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${uid}/${propertyId}/alarm-test-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("meter-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setData((p) => ({ ...p, alarmTestUploading: false }));
      return;
    }
    const { data: urlData } = await supabase.storage.from("meter-photos").createSignedUrl(path, 3600);
    setData((p) => ({ ...p, alarmTestPhotoUrl: urlData?.signedUrl || null, alarmTestUploading: false }));
    toast({ title: "Photo uploaded", description: "Alarm test photo saved." });
  };

  const handleOilPhotoUpload = async (file: File) => {
    setData((p) => ({ ...p, oilPhotoUploading: true }));
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData?.user?.id;
    if (!uid) {
      toast({ title: "Upload failed", description: "You must be signed in.", variant: "destructive" });
      setData((p) => ({ ...p, oilPhotoUploading: false }));
      return;
    }
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${uid}/${propertyId}/oil-tank-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("meter-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setData((p) => ({ ...p, oilPhotoUploading: false }));
      return;
    }
    const { data: urlData } = await supabase.storage.from("meter-photos").createSignedUrl(path, 3600);
    setData((p) => ({ ...p, oilPhotoUrl: urlData?.signedUrl || null, oilPhotoUploading: false }));
    toast({ title: "Photo uploaded", description: "Oil tank photo saved." });
  };

  const triggerFileInput = (key: "gas" | "electric" | "water" | "alarmTest" | "oilTank") => {
    fileInputRefs[key].current?.click();
  };

  /* ─── validation ─── */
  const utilityOk =
    data.utilityNA ||
    ((noGas || data.gas.reading.trim() !== "") &&
      data.electric.reading.trim() !== "" &&
      (data.waterNA || data.water.reading.trim() !== ""));

  const legalOk =
    data.legalNA ||
    (data.epcReceived &&
      (noGas || data.gasSafetyReceived) &&
      data.eicrReceived &&
      data.howToRentReceived &&
      data.govInfoSheetReceived);

  const canAdvanceTo = (targetStep: number): boolean => {
    if (targetStep === 1 && !data.propertyType) return false;
    if (targetStep <= 3) return true;
    return utilityOk && legalOk; // step 4 (summary)
  };

  const handleNext = () => {
    const target = step + 1;
    // Skip building step for houses
    const actualTarget = target === 3 && !showBuilding ? 4 : target;
    if (!canAdvanceTo(actualTarget)) {
      const missing: string[] = [];
      if (actualTarget === 1 && !data.propertyType) missing.push("a property type");
      if (!utilityOk) missing.push("utility evidence (or mark N/A)");
      if (!legalOk) missing.push("legal paperwork (or mark N/A)");
      setValidationMsg(`Please complete ${missing.join(" and ")} before proceeding.`);
      return;
    }
    setValidationMsg(null);
    setStep(actualTarget);
  };

  const handleBack = () => {
    setValidationMsg(null);
    const target = step - 1;
    // Skip building step for houses when going back
    setStep(target === 3 && !showBuilding ? 2 : target);
  };

  /* ─── progress ─── */
  const totalSteps = showBuilding ? STEPS.length : STEPS.length - 1;
  const currentIdx = !showBuilding && step > 3 ? step - 1 : step;
  const progressPercent = Math.round(((currentIdx + 1) / totalSteps) * 100);

  /* ─── save to Supabase ─── */

  const handleSave = async () => {
    if (!propertyId) {
      toast({ title: "Error", description: "No property selected.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    // Ensure property exists in Supabase (it may only exist in localStorage)
    if (userId) {
      const { data: propCheck } = await supabase
        .from("properties")
        .select("id")
        .eq("id", propertyId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!propCheck) {
        // Property exists locally but not in Supabase — sync it now
        const heatingType = heatingParam || "gas";
        const { error: insertError } = await supabase.from("properties").insert({
          id: propertyId,
          address: propertyAddress,
          user_id: userId,
          heating_type: heatingType,
          has_gas_supply: heatingType === "gas",
        });
        if (insertError) {
          toast({ title: "Save failed", description: "Could not sync property: " + insertError.message, variant: "destructive" });
          setSaving(false);
          return;
        }
      }
    }

    const payload = {
      property_id: propertyId,
      gas_reading: data.utilityNA || noGas ? "not_applicable" : (data.gas.reading || null),
      electric_reading: data.utilityNA ? "not_applicable" : (data.electric.reading || null),
      water_reading: data.utilityNA || data.waterNA ? "not_applicable" : (data.water.reading || null),
      gas_meter_reading: data.utilityNA || noGas ? "not_applicable" : (data.gas.reading || null),
      gas_meter_photo_url: data.utilityNA || noGas ? null : data.gas.photoUrl,
      electric_meter_reading: data.utilityNA ? "not_applicable" : (data.electric.reading || null),
      electric_meter_photo_url: data.utilityNA ? null : data.electric.photoUrl,
      water_meter_reading: data.utilityNA || data.waterNA ? "not_applicable" : (data.water.reading || null),
      water_meter_photo_url: data.utilityNA || data.waterNA ? null : data.water.photoUrl,
      smoke_alarm_photo_url: data.alarmTestPhotoUrl,
      smoke_alarms_tested: data.smokeAlarmsTested,
      stopcock_located: data.stopcockNA ? false : data.stopcockShown,
      window_restrictors_ok: data.windowRestrictorsNA ? null : data.windowRestrictors,
      gas_safety_received: data.legalNA || noGas ? false : data.gasSafetyReceived,
      epc_received: data.legalNA ? false : data.epcReceived,
      eicr_received: data.legalNA ? false : data.eicrReceived,
      how_to_rent_received: data.legalNA ? false : data.howToRentReceived,
      gov_info_sheet_received: data.legalNA ? false : data.govInfoSheetReceived,
      how_to_rent_2026_provided: data.legalNA ? false : data.howToRentReceived,
      gov_info_sheet_provided: data.legalNA ? false : data.govInfoSheetReceived,
      tenant_signature: data.tenantSignature,
      completed_at: new Date().toISOString(),
    };

    if (!userId) {
      const existing = JSON.parse(localStorage.getItem("landy-inductions") || "[]");
      localStorage.setItem("landy-inductions", JSON.stringify([...existing, { ...payload, propertyId }]));
      toast({ title: "Induction saved locally", description: "Sign in to sync to the cloud." });
      setSaving(false);
      navigate("/");
      return;
    }

    const { error } = await supabase.from("inductions").insert({
      ...payload,
      user_id: userId,
    } as any);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Induction complete ✓", description: "All details saved to your account." });
    navigate("/");
  };

  /* ─── PDF ─── */
  const handleGeneratePdf = async () => {
    if (!isPro) { setProModalOpen(true); return; }
    const { data: reportRows } = await supabase
      .from("induction_report_data" as any)
      .select("*")
      .eq("property_address", propertyAddress)
      .order("completion_date", { ascending: false })
      .limit(1);
    const report = (reportRows as any)?.[0];
    generateHandoverPdf({
      propertyAddress: report?.property_address || propertyAddress,
      gas: { reading: noGas ? "not_applicable" : (report?.gas_reading || data.gas.reading), photoTaken: !noGas && !!data.gas.photoUrl },
      electric: { reading: report?.electric_reading || data.electric.reading, photoTaken: !!data.electric.photoUrl },
      water: { reading: data.waterNA ? "not_applicable" : (report?.water_reading || data.water.reading), photoTaken: !data.waterNA && !!data.water.photoUrl },
      smokeAlarmsTested: data.smokeAlarmsTested,
      carbonMonoxideTested: data.carbonMonoxideTested,
      stopcockShown: data.stopcockShown,
      gasSafetyReceived: noGas ? false : data.gasSafetyReceived,
      epcReceived: data.epcReceived,
      eicrReceived: data.eicrReceived,
      govInfoSheetReceived: data.govInfoSheetReceived,
      tenantSignature: report?.tenant_signature || data.tenantSignature,
      completedAt: report?.completion_date || new Date().toISOString(),
    });
    toast({ title: "PDF generated", description: "Your signed certificate has been downloaded." });
  };

  const serifFont = { fontFamily: "Georgia, 'Times New Roman', serif" };

  /* ─── summary data ─── */
  const summaryItems = [
    { label: "Property Type", value: data.propertyType ? data.propertyType.toUpperCase() : "—", na: false },
    { label: "Heating", value: data.hasGas ? "Gas" : hasOil ? "Oil" : "Electric Only", na: false },
    { label: "Utility Evidence", value: data.utilityNA ? "N/A" : "Completed", na: data.utilityNA },
    ...(noGas ? [] : [{ label: "Gas Reading", value: data.utilityNA ? "N/A" : (data.gas.reading || "—"), na: data.utilityNA }]),
    { label: "Electric Reading", value: data.utilityNA ? "N/A" : (data.electric.reading || "—"), na: data.utilityNA },
    { label: "Water Reading", value: data.utilityNA || data.waterNA ? "N/A" : (data.water.reading || "—"), na: data.utilityNA || data.waterNA },
    ...(hasOil ? [
      { label: "Oil Level", value: data.utilityNA ? "N/A" : (data.oilLevel || "—"), na: data.utilityNA },
      { label: "Tank — No Cracks", value: data.oilTankNoCracks ? "✓" : "✗", na: false },
      { label: "Tank Base Stable", value: data.oilBaseStable ? "✓" : "✗", na: false },
      { label: "Oil Tank Photo", value: data.oilPhotoUrl ? "✓" : "✗", na: false },
    ] : []),
    { label: "Legal Paperwork", value: data.legalNA ? "N/A" : "Completed", na: data.legalNA },
    ...(data.legalNA ? [] : [
      { label: "How to Rent Guide", value: data.howToRentReceived ? "✓" : "✗", na: false },
      { label: "Gov Info Sheet", value: data.govInfoSheetReceived ? "✓" : "✗", na: false },
      { label: "EPC", value: data.epcReceived ? "✓" : "✗", na: false },
      { label: "EICR", value: data.eicrReceived ? "✓" : "✗", na: false },
      ...(noGas ? [] : [{ label: "Gas Safety Cert", value: data.gasSafetyReceived ? "✓" : "✗", na: false }]),
    ]),
    { label: "Safety & Condition", value: "Completed", na: false },
    { label: "Smoke Alarms", value: data.smokeAlarmsTested ? "✓" : "✗", na: false },
    { label: "CO Alarms", value: data.carbonMonoxideTested ? "✓" : "✗", na: false },
    { label: "Damp/Mould Check", value: data.dampMouldCheck ? "✓" : "✗", na: false },
    { label: "Window Restrictors", value: data.windowRestrictorsNA ? "N/A" : (data.windowRestrictors ? "✓" : "✗"), na: data.windowRestrictorsNA },
    { label: "Stopcock Location", value: data.stopcockNA ? "N/A" : (data.stopcockShown ? "✓" : "✗"), na: data.stopcockNA },
    ...(showBuilding ? [
      { label: "Building Specifics", value: data.buildingNA ? "N/A" : "Completed", na: data.buildingNA },
      ...(data.buildingNA ? [] : [
        { label: "Fire Doors", value: data.fireDoors ? "✓" : "✗", na: false },
        { label: "Communal Areas", value: data.communalAreas ? "✓" : "✗", na: false },
        ...(isHmo ? [
          { label: "HMO License", value: data.hmoLicense ? "✓" : "✗", na: false },
          { label: "Fire Extinguishers", value: data.fireExtinguishers ? "✓" : "✗", na: false },
          { label: "Fire Exit Signage", value: data.fireExitSignage ? "✓" : "✗", na: false },
        ] : []),
      ]),
    ] : []),
  ];

  /* ─── hidden file inputs (stable refs) ─── */
  const fileInputElements = (
    <>
      {(["gas", "electric", "water"] as const).map((key) => (
        <input key={key} ref={fileInputRefs[key]} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(key, file); }} />
      ))}
    </>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--hygge-cream))" }}>
      <div className="mx-auto max-w-lg px-4 pb-12">
        {/* Hero */}
        <div className="relative -mx-4 mb-2">
          <img src={heroImg} alt="A key resting on a wooden table" className="w-full h-52 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button onClick={() => navigate("/")}
            className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur text-foreground hover:bg-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <h1 className="text-2xl font-semibold text-white tracking-tight" style={serifFont}>
              2026 Compliance Walkthrough
            </h1>
            <p className="text-white/80 text-sm mt-0.5 truncate">{propertyAddress}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-1 mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentIdx + 1} of {totalSteps} — {STEPS[step].label}
            </span>
            <span className="text-xs font-semibold" style={{ color: "hsl(var(--hygge-sage))" }}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--border))" }}>
            <div className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%`, backgroundColor: "hsl(var(--hygge-sage))" }} />
          </div>
        </div>

        {/* Step labels */}
        <div className="flex items-center gap-1 mb-8 px-1">
          {STEPS.filter((_, i) => showBuilding || i !== 3).map((s, i) => {
            const stepIdx = showBuilding ? i : (i >= 3 ? i + 1 : i);
            const active = stepIdx === step;
            const done = stepIdx < step;
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1 rounded-full transition-colors"
                  style={{ backgroundColor: done || active ? "hsl(var(--hygge-sage))" : "hsl(var(--border))" }} />
                <span className="text-[11px] font-medium"
                  style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
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

        {/* ─── Step 0: Property Profile ─── */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>Property Profile</h2>
            <p className="text-sm text-muted-foreground -mt-3">
              Tell us about the property so we can tailor the compliance checks.
            </p>

            {/* Property type selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Property Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { type: "house" as const, label: "House", icon: Home },
                  { type: "flat" as const, label: "Flat / Apt", icon: Building2 },
                  { type: "hmo" as const, label: "HMO", icon: Users },
                ]).map(({ type, label, icon: Icon }) => {
                  const selected = data.propertyType === type;
                  return (
                    <button key={type} onClick={() => setData((p) => ({ ...p, propertyType: type }))}
                      className="flex flex-col items-center gap-2.5 rounded-2xl border-2 p-5 transition-all"
                      style={{
                        borderColor: selected ? "hsl(var(--hygge-sage))" : "hsl(var(--border))",
                        backgroundColor: selected ? "hsl(var(--hygge-sage) / 0.08)" : "hsl(var(--card))",
                      }}>
                      <div className="flex items-center justify-center w-11 h-11 rounded-xl"
                        style={{ backgroundColor: selected ? "hsl(var(--hygge-sage) / 0.2)" : "hsl(var(--hygge-sage) / 0.1)" }}>
                        <Icon className="w-5 h-5" style={{ color: selected ? "hsl(var(--hygge-sage))" : "hsl(var(--muted-foreground))" }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
                        {label}
                      </span>
                      {selected && <Check className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heating type — Gas vs Oil */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Heating Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: "gas" as const, label: "Gas", icon: Flame },
                  { key: "oil" as const, label: "Oil", icon: Droplet },
                ]).map(({ key, label, icon: HIcon }) => {
                  const selected = key === "gas" ? data.hasGas && !data.hasOil : data.hasOil;
                  return (
                    <button key={key} onClick={() => {
                      if (key === "gas") setData((p) => ({ ...p, hasGas: true, hasOil: false }));
                      else setData((p) => ({ ...p, hasGas: false, hasOil: true }));
                    }}
                      className="flex flex-col items-center gap-2 rounded-[12px] border-2 p-4 transition-all"
                      style={{
                        borderColor: selected ? "hsl(var(--hygge-sage))" : "hsl(var(--border))",
                        backgroundColor: selected ? "hsl(var(--hygge-sage) / 0.08)" : "hsl(var(--card))",
                      }}>
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg"
                        style={{ backgroundColor: selected ? "hsl(var(--hygge-sage) / 0.2)" : "hsl(var(--hygge-sage) / 0.1)" }}>
                        <HIcon className="w-4 h-4" style={{ color: selected ? "hsl(var(--hygge-sage))" : "hsl(var(--muted-foreground))" }} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: selected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
                        {label}
                      </span>
                      {selected && <Check className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />}
                    </button>
                  );
                })}
              </div>
              {/* Neither gas nor oil option */}
              <button
                onClick={() => setData((p) => ({ ...p, hasGas: false, hasOil: false }))}
                className="w-full text-xs text-muted-foreground hover:text-foreground underline mt-1 text-center"
              >
                No gas or oil — electric only
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 1: Utility Evidence ─── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>Utility Evidence</h2>
            <p className="text-sm text-muted-foreground -mt-2">Meter readings and photo proof for compliance records.</p>

            <SectionCard title="Meter Readings & Photos" icon={Gauge}
              naActive={data.utilityNA} onToggleNA={() => setData((p) => ({ ...p, utilityNA: !p.utilityNA }))}>
              <div className="space-y-5">
                {!noGas && (
                  <MeterCardInput
                    meterKey="gas" label="Gas" icon={Flame}
                    reading={data.gas.reading} photoUrl={data.gas.photoUrl} uploading={data.gas.uploading}
                    onReadingChange={(v) => updateMeter("gas", { reading: v })}
                    onTriggerPhoto={() => triggerFileInput("gas")}
                  />
                )}
                <MeterCardInput
                  meterKey="electric" label="Electric" icon={Zap}
                  reading={data.electric.reading} photoUrl={data.electric.photoUrl} uploading={data.electric.uploading}
                  onReadingChange={(v) => updateMeter("electric", { reading: v })}
                  onTriggerPhoto={() => triggerFileInput("electric")}
                />
                <MeterCardInput
                  meterKey="water" label="Water" icon={Droplets}
                  reading={data.water.reading} photoUrl={data.water.photoUrl} uploading={data.water.uploading}
                  isWaterNA={data.waterNA}
                  onWaterNAChange={(v) => setData((p) => ({ ...p, waterNA: v }))}
                  onReadingChange={(v) => updateMeter("water", { reading: v })}
                  onTriggerPhoto={() => triggerFileInput("water")}
                />
              </div>
              {fileInputElements}
            </SectionCard>

            {/* Oil Heating Evidence */}
            {hasOil && !data.utilityNA && (
              <SectionCard title="Oil Heating Evidence" icon={Droplet}>
                <div className="space-y-4">
                  <MeterCardInput
                    meterKey="oil" label="Oil Level (%)" icon={Droplet}
                    reading={data.oilLevel} photoUrl={null} uploading={false}
                    onReadingChange={(v) => setData((p) => ({ ...p, oilLevel: v }))}
                    onTriggerPhoto={() => {}}
                  />

                  <div className="flex items-start gap-3">
                    <Checkbox id="oilTankNoCracks" checked={data.oilTankNoCracks}
                      onCheckedChange={(v) => setData((p) => ({ ...p, oilTankNoCracks: !!v }))} className="mt-0.5" />
                    <Label htmlFor="oilTankNoCracks" className="text-sm cursor-pointer leading-snug">
                      No visible cracks or leaks on tank
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox id="oilBaseStable" checked={data.oilBaseStable}
                      onCheckedChange={(v) => setData((p) => ({ ...p, oilBaseStable: !!v }))} className="mt-0.5" />
                    <Label htmlFor="oilBaseStable" className="text-sm cursor-pointer leading-snug">
                      Tank base is level and non-combustible
                    </Label>
                  </div>

                  {/* Oil tank photo */}
                  <div>
                    <input ref={fileInputRefs.oilTank} type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleOilPhotoUpload(file); }} />
                    <Button variant="outline" className="w-full rounded-[12px] gap-2"
                      style={data.oilPhotoUrl ? { backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))", borderColor: "hsl(var(--hygge-sage))" } : {}}
                      disabled={data.oilPhotoUploading} onClick={() => triggerFileInput("oilTank")}>
                      {data.oilPhotoUploading ? <span className="landy-spinner" /> : <Camera className="w-4 h-4" />}
                      {data.oilPhotoUrl ? "Oil Tank Photo ✓" : data.oilPhotoUploading ? "Uploading…" : "Photo of Oil Tank & Lines"}
                    </Button>
                  </div>

                  {/* OFTEC tip */}
                  <div className="rounded-[12px] p-4" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.08)", border: "1px solid hsl(var(--hygge-sage) / 0.2)" }}>
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--hygge-sage))" }} />
                      <div>
                        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                          Pro Recommendation
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                          While an Oil Cert isn't legally mandatory, an annual OFTEC inspection is recommended to prevent environmental fines of up to <span className="font-semibold text-foreground">£20,000</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* ─── Step 2: Legal Paperwork ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>Legal Paperwork</h2>
            <p className="text-sm text-muted-foreground -mt-2">Confirm each document has been provided to the tenant.</p>

            <SectionCard title="Required Documents" icon={FileText}
              naActive={data.legalNA} onToggleNA={() => setData((p) => ({ ...p, legalNA: !p.legalNA }))}>
              <div className="divide-y divide-border">
                {[
                  { key: "howToRentReceived" as const, label: "How to Rent Guide provided" },
                  { key: "govInfoSheetReceived" as const, label: "Government Information Sheet 2026" },
                  { key: "epcReceived" as const, label: "EPC provided" },
                  { key: "eicrReceived" as const, label: "EICR provided" },
                  ...(!noGas ? [{ key: "gasSafetyReceived" as const, label: "Gas Safety Certificate provided" }] : []),
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <Label htmlFor={key} className="text-sm cursor-pointer flex-1 pr-4">{label}</Label>
                    <Switch id={key} checked={data[key]} onCheckedChange={(v) => setData((p) => ({ ...p, [key]: v }))} />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ─── Step 3: Building Specifics (Flat/HMO only) ─── */}
        {step === 3 && showBuilding && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>Building Specifics</h2>
            <p className="text-sm text-muted-foreground -mt-2">
              {isHmo ? "HMO license and shared facility checks." : "Communal area and building safety checks."}
            </p>

            <SectionCard title={isHmo ? "License & Shared Facilities" : "Communal & Building Safety"} icon={Building2}
              naActive={data.buildingNA} onToggleNA={() => setData((p) => ({ ...p, buildingNA: !p.buildingNA }))}>
              <div className="space-y-3.5">
                {[
                  { id: "fireDoors" as const, label: "Fire Doors Checked", icon: DoorOpen },
                  { id: "communalAreas" as const, label: "Communal Areas Inspected", icon: Eye },
                  ...(isFlat ? [
                    { id: "intercom" as const, label: "Intercom Operational", icon: Radio },
                    { id: "liftAccess" as const, label: "Lift Access Confirmed", icon: ArrowUpDown },
                  ] : []),
                  ...(isHmo ? [
                    { id: "hmoLicense" as const, label: "HMO License Displayed", icon: ShieldCheck },
                    { id: "fireExtinguishers" as const, label: "Fire Extinguishers Present", icon: FireExtinguisher },
                    { id: "fireExitSignage" as const, label: "Fire Exit Signage Visible", icon: LogOut },
                  ] : []),
                ].map(({ id, label, icon: CIcon }) => (
                  <div key={id} className="flex items-start gap-3">
                    <Checkbox id={id} checked={data[id]} onCheckedChange={(v) => setData((p) => ({ ...p, [id]: !!v }))} className="mt-0.5" />
                    <Label htmlFor={id} className="text-sm cursor-pointer leading-snug flex items-center gap-1.5">
                      <CIcon className="w-3.5 h-3.5 text-muted-foreground" /> {label}
                    </Label>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ─── Step 2 (for houses) / Step 3 interstitial: Safety & Condition ─── */}
        {/* Safety is shown within step 1's evidence or as part of the summary — 
            Actually, let's add safety as a sub-section within step 1 below the meters */}

        {/* ─── Step 4: Summary & Signature (The Shield) ─── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-foreground" style={serifFont}>Compliance Summary</h2>
            <p className="text-sm text-muted-foreground -mt-3">
              Review what was completed and what was marked N/A.
            </p>

            {/* Summary table */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="divide-y divide-border">
                {summaryItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <span className={`text-sm ${item.na ? "text-muted-foreground italic" : "text-foreground"}`}>{item.label}</span>
                    <span className={`text-sm font-medium ${item.na ? "text-muted-foreground" : item.value === "✗" ? "text-destructive" : ""}`}
                      style={!item.na && item.value === "✓" ? { color: "hsl(var(--hygge-sage))" } : {}}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Condition — no global N/A, individual toggles instead */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}>
                  <Shield className="w-4 h-4" style={{ color: "hsl(var(--hygge-sage))" }} />
                </div>
                <span className="text-sm font-semibold text-foreground">Safety & Condition</span>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <Checkbox id="smokeAlarmsTested" checked={data.smokeAlarmsTested}
                    onCheckedChange={(v) => setData((p) => ({ ...p, smokeAlarmsTested: !!v }))} className="mt-0.5" />
                  <Label htmlFor="smokeAlarmsTested" className="text-sm cursor-pointer leading-snug">Smoke Alarms Tested</Label>
                </div>
                {data.hasGas && (
                  <div className="flex items-start gap-3">
                    <Checkbox id="carbonMonoxideTested" checked={data.carbonMonoxideTested}
                      onCheckedChange={(v) => setData((p) => ({ ...p, carbonMonoxideTested: !!v }))} className="mt-0.5" />
                    <Label htmlFor="carbonMonoxideTested" className="text-sm cursor-pointer leading-snug">CO Alarms Tested</Label>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Checkbox id="dampMouldCheck" checked={data.dampMouldCheck}
                    onCheckedChange={(v) => setData((p) => ({ ...p, dampMouldCheck: !!v }))} className="mt-0.5" />
                  <Label htmlFor="dampMouldCheck" className="text-sm cursor-pointer leading-snug">Damp & Mould Check</Label>
                </div>

                {/* Window Restrictors — with individual N/A */}
                <div className={`flex items-center gap-3 transition-opacity ${data.windowRestrictorsNA ? "opacity-40" : ""}`}>
                  <Checkbox id="windowRestrictors" checked={data.windowRestrictors}
                    disabled={data.windowRestrictorsNA}
                    onCheckedChange={(v) => setData((p) => ({ ...p, windowRestrictors: !!v }))} className="mt-0.5" />
                  <Label htmlFor="windowRestrictors" className={`text-sm cursor-pointer leading-snug flex-1 ${data.windowRestrictorsNA ? "line-through" : ""}`}>
                    Window Restrictors Checked
                  </Label>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground">N/A</span>
                    <Switch
                      checked={data.windowRestrictorsNA}
                      onCheckedChange={(v) => setData((p) => ({
                        ...p,
                        windowRestrictorsNA: v,
                        windowRestrictors: v ? false : p.windowRestrictors,
                      }))}
                      className="data-[state=checked]:bg-hygge-sage scale-75"
                    />
                  </div>
                </div>

                {/* Alarm test photo */}
                <div className="pt-1">
                  <input ref={fileInputRefs.alarmTest} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAlarmPhotoUpload(file); }} />
                  <Button variant="outline" className="w-full rounded-xl gap-2"
                    style={data.alarmTestPhotoUrl ? { backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))", borderColor: "hsl(var(--hygge-sage))" } : {}}
                    disabled={data.alarmTestUploading} onClick={() => triggerFileInput("alarmTest")}>
                    {data.alarmTestUploading ? <span className="landy-spinner" /> : <Camera className="w-4 h-4" />}
                    {data.alarmTestPhotoUrl ? "Alarm Photo ✓" : data.alarmTestUploading ? "Uploading…" : "Photo of Alarm Test"}
                  </Button>
                </div>

                {/* Stopcock — with individual N/A */}
                <div className={`flex items-center gap-3 transition-opacity ${data.stopcockNA ? "opacity-40" : ""}`}>
                  <Checkbox id="stopcockShown" checked={data.stopcockShown}
                    disabled={data.stopcockNA}
                    onCheckedChange={(v) => setData((p) => ({ ...p, stopcockShown: !!v }))} className="mt-0.5" />
                  <Label htmlFor="stopcockShown" className={`text-sm cursor-pointer leading-snug flex-1 ${data.stopcockNA ? "line-through" : ""}`}>
                    Stopcock Location Shown
                  </Label>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground">N/A</span>
                    <Switch
                      checked={data.stopcockNA}
                      onCheckedChange={(v) => setData((p) => ({
                        ...p,
                        stopcockNA: v,
                        stopcockShown: v ? false : p.stopcockShown,
                      }))}
                      className="data-[state=checked]:bg-hygge-sage scale-75"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Pad */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground" style={serifFont}>Tenant Signature</h3>
                {!isPro && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)", color: "hsl(var(--hygge-sage))" }}>
                    <Sparkles className="w-3 h-3" /> PRO
                  </span>
                )}
              </div>
              {isPro ? (
                <>
                  <p className="text-sm text-muted-foreground">Ask the tenant to sign below to confirm the walkthrough.</p>
                  <SignaturePad onSignatureChange={(sig) => setData((p) => ({ ...p, tenantSignature: sig }))} />
                </>
              ) : (
                <div className="relative">
                  <div className="blur-[6px] pointer-events-none select-none opacity-60">
                    <div className="rounded-xl border-2 border-dashed border-border h-40 flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Sign here</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl"
                      style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}>
                      <Lock className="w-5 h-5" style={{ color: "hsl(var(--hygge-sage))" }} />
                    </div>
                    <p className="text-sm font-medium text-foreground text-center max-w-[260px] leading-snug">
                      A digital signature creates a legally-binding evidence trail
                    </p>
                    <button onClick={() => setProModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))" }}>
                      Unlock with Landy Pro
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PDF generation */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h3 className="text-base font-semibold text-foreground" style={serifFont}>Signed Certificate</h3>
              {isPro ? (
                <>
                  <p className="text-sm text-muted-foreground">Generate a timestamped PDF with all evidence.</p>
                  <button onClick={handleGeneratePdf}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))" }}>
                    <Download className="w-4 h-4" /> Generate Signed Certificate
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.08)" }}>
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-semibold">Did you know?</span> From 2026, landlords without proper handover documentation face fines up to <span className="font-semibold">£7,000</span>.
                    </p>
                  </div>
                  <button onClick={() => setProModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))" }}>
                    <Sparkles className="w-4 h-4" /> Upgrade to unlock certificates
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── Navigation ─── */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          )}
          {step < 4 ? (
            <button
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl h-12 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))" }}
              onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl h-12 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "hsl(var(--hygge-sage))", color: "hsl(var(--hygge-sage-foreground))" }}
              onClick={handleSave} disabled={saving}>
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
