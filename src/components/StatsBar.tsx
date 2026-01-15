import { useEffect, useState } from "react";
import { Card } from "./ui/Card";
import { secondsToHoursRounded } from "../utils/time";

type StatsBarProps = {
  totalSteps: number;
  totalTimeSeconds: number;
  questionsAsked: number;
};

const AnimatedNumber = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="tabular-nums">
      {display}{suffix}
    </span>
  );
};

export const StatsBar = ({
  totalSteps,
  totalTimeSeconds,
  questionsAsked,
}: StatsBarProps) => {
  const stats = [
    { label: "Lernschritte", value: totalSteps, icon: "📚", suffix: "" },
    { label: "Gesamtzeit", value: secondsToHoursRounded(totalTimeSeconds), icon: "⏱️", suffix: "h" },
    { label: "Fragen gestellt", value: questionsAsked, icon: "💬", suffix: "" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="bg-gradient-to-br from-primary via-primary-soft via-indigo-500 to-purple-600 px-4 py-3 text-white animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] border border-primary/40"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">{stat.icon}</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-white/90 font-medium">
                {stat.label}
              </div>
              <div className="text-2xl font-bold">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
