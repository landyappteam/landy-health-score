import { ShieldCheck, Sparkles } from "lucide-react";
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
        className="relative z-10 w-full max-w-sm rounded-[12px] border border-border p-7 shadow-xl text-center space-y-4"
        style={{ backgroundColor: "hsl(var(--hygge-cream))" }}
      >
        <div
          className="mx-auto flex items-center justify-center w-14 h-14 rounded-[12px]"
          style={{ backgroundColor: "hsl(var(--hygge-sage) / 0.15)" }}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: "hsl(var(--hygge-sage))" }} />
        </div>

        <h2
          className="text-xl font-semibold text-foreground"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Unlock Your Legal Shield
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          This feature is part of <span className="font-semibold text-foreground">Landy Pro</span>.
          Upgrade to access professional documentation, automated 2026 compliance checks, and PDF exports.
        </p>

        <p className="text-xs text-muted-foreground leading-relaxed">
          From 2026, landlords without proper documentation face fines up to{" "}
          <span className="font-semibold text-foreground">£7,000</span>. Landy Pro is your peace of mind.
        </p>

        <div className="space-y-2 pt-2">
          <button
            className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] h-11 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "hsl(var(--hygge-sage))",
              color: "hsl(var(--hygge-sage-foreground))",
            }}
            onClick={() => {
              // TODO: navigate to Stripe checkout
              onClose();
            }}
          >
            <Sparkles className="w-4 h-4" />
            See Pro Plans
          </button>
          <Button variant="ghost" className="w-full rounded-[12px]" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProUpsellModal;
