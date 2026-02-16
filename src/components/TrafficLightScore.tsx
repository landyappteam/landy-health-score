import { useMemo } from "react";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface TrafficLightScoreProps {
  score: number;
  propertyCount: number;
}

const TrafficLightScore = ({ score, propertyCount }: TrafficLightScoreProps) => {
  const { color, bg, label, Icon } = useMemo(() => {
    if (score >= 80)
      return { color: "hsl(var(--score-excellent))", bg: "hsl(var(--score-excellent) / 0.12)", label: "Green — All Clear", Icon: ShieldCheck };
    if (score >= 50)
      return { color: "hsl(var(--score-fair))", bg: "hsl(var(--score-fair) / 0.12)", label: "Amber — Action Needed", Icon: Shield };
    return { color: "hsl(var(--score-poor))", bg: "hsl(var(--score-poor) / 0.12)", label: "Red — Urgent", Icon: ShieldAlert };
  }, [score]);

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-5">
        {/* Circle */}
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle
              cx="48" cy="48" r="42" fill="none"
              stroke={color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>{score}%</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <h2 className="text-base font-bold text-foreground">{label}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {propertyCount === 0
              ? "Add a property to begin"
              : `Portfolio compliance across ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafficLightScore;
