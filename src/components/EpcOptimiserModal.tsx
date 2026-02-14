import { Lightbulb, X, ThermometerSun, Droplets, Sun } from "lucide-react";

interface EpcOptimiserModalProps {
  open: boolean;
  onClose: () => void;
}

const suggestions = [
  {
    icon: ThermometerSun,
    title: "Install loft insulation",
    impact: "High",
    description: "Adding or topping up loft insulation to 270mm can improve your EPC rating by up to 2 bands.",
  },
  {
    icon: Droplets,
    title: "Upgrade boiler",
    impact: "Medium",
    description: "Replacing an old boiler with an A-rated condensing boiler improves heating efficiency.",
  },
  {
    icon: Sun,
    title: "Install LED lighting",
    impact: "Low",
    description: "Switching all bulbs to LED reduces energy consumption and is low cost.",
  },
];

const EpcOptimiserModal = ({ open, onClose }: EpcOptimiserModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 rounded-2xl bg-card border border-border shadow-xl p-5 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-score-good" />
            <h2 className="text-lg font-semibold text-card-foreground">EPC Optimiser</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Suggested improvements to boost your EPC rating:
        </p>
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.title} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <s.icon className="w-5 h-5 text-score-good shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-card-foreground">{s.title}</span>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    s.impact === "High" ? "bg-score-excellent/15 text-score-excellent" :
                    s.impact === "Medium" ? "bg-score-fair/15 text-score-fair" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {s.impact} impact
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EpcOptimiserModal;
