import { useMemo } from "react";

interface ComplianceScoreProps {
  score: number;
  propertyCount: number;
}

const ComplianceScore = ({ score, propertyCount }: ComplianceScoreProps) => {
  const { colour, label } = useMemo(() => {
    if (score >= 80) return { colour: "text-score-excellent", label: "Excellent" };
    if (score >= 60) return { colour: "text-score-good", label: "Good" };
    if (score >= 40) return { colour: "text-score-fair", label: "Fair" };
    return { colour: "text-score-poor", label: "Needs Attention" };
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const strokeColour = useMemo(() => {
    if (score >= 80) return "hsl(var(--score-excellent))";
    if (score >= 60) return "hsl(var(--score-good))";
    if (score >= 40) return "hsl(var(--score-fair))";
    return "hsl(var(--score-poor))";
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={strokeColour}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colour}`}>
            {score}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Compliance Health Score</h2>
        <p className="text-sm text-muted-foreground">
          {propertyCount === 0
            ? "Add a property to get started"
            : `${label} · ${propertyCount} ${propertyCount === 1 ? "property" : "properties"}`}
        </p>
      </div>
    </div>
  );
};

export default ComplianceScore;
