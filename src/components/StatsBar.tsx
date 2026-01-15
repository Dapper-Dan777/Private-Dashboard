import { Card } from "./ui/Card";
import { secondsToHoursRounded } from "../utils/time";

type StatsBarProps = {
  totalSteps: number;
  totalTimeSeconds: number;
  questionsAsked: number;
};

export const StatsBar = ({
  totalSteps,
  totalTimeSeconds,
  questionsAsked,
}: StatsBarProps) => {
  const stats = [
    { label: "Lernschritte", value: totalSteps },
    { label: "Gesamtzeit", value: `${secondsToHoursRounded(totalTimeSeconds)}h` },
    { label: "Fragen gestellt", value: questionsAsked },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-gradient-to-br from-primary to-indigo-400 px-4 py-3 text-white animate-fade-in transition hover:-translate-y-0.5 hover:shadow-lg border border-primary/40"
        >
          <div className="text-xs uppercase tracking-wide text-white/85">
            {stat.label}
          </div>
          <div className="text-2xl font-semibold">{stat.value}</div>
        </Card>
      ))}
    </div>
  );
};
