import { Lock, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProUpsellModalProps {
  open: boolean;
  onClose: () => void;
}

const ProUpsellModal = ({ open, onClose }: ProUpsellModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border p-7 shadow-xl text-center space-y-4"
        style={{ backgroundColor: "hsl(var(--hygge-cream))" }}
      >
        <div
          className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: "hsl(var(--hygge-sage))" }} />
        </div>

        <h2
          className="text-xl font-semibold text-foreground"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Protect yourself from the £7,000 fine
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          From 2026, landlords without proper documentation face fines up to{" "}
          <span className="font-semibold text-foreground">£7,000</span>. A signed,
          timestamped handover certificate is your best evidence that you followed
          every step.
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Landy Pro gives you digital tenant signatures and professionally generated
          PDF certificates — your peace of mind in one tap.
        </p>

        <div className="space-y-2 pt-2">
          <button
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "hsl(var(--hygge-sage))",
              color: "hsl(var(--hygge-sage-foreground))",
            }}
            onClick={() => {
              // Future: navigate to subscription page
              onClose();
            }}
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Landy Pro
          </button>
          <Button variant="ghost" className="w-full rounded-xl" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProUpsellModal;
