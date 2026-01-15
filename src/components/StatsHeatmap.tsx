import { Card } from "./ui/Card";
import type { LearningStep } from "../types";
import { useI18n } from "../context/I18nContext";

type StatsHeatmapProps = {
  steps: ReadonlyArray<LearningStep>;
};

const getDayKey = (date: Date) =>
  date.toISOString().slice(0, 10);

export const StatsHeatmap = ({ steps }: StatsHeatmapProps) => {
  const { t, language } = useI18n();
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });

  const totalsByDay = new Map<string, number>();
  steps.forEach((step) => {
    step.sessions.forEach((session) => {
      const key = getDayKey(new Date(session.startAt));
      totalsByDay.set(
        key,
        (totalsByDay.get(key) ?? 0) + session.durationSeconds
      );
    });
  });

  const maxSeconds = Math.max(
    1,
    ...days.map((date) => totalsByDay.get(getDayKey(date)) ?? 0)
  );

  return (
    <Card className="p-5 bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {t("stats.heatmapTitle")}
      </div>
      <div className="mt-4 grid grid-cols-7 gap-3">
        {days.map((date) => {
          const key = getDayKey(date);
          const value = totalsByDay.get(key) ?? 0;
          const height = Math.max(12, Math.round((value / maxSeconds) * 56));
          return (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {date.toLocaleDateString(language === "en" ? "en-US" : "de-DE", {
                  weekday: "short",
                })}
              </div>
              <div className="flex h-16 items-end">
                <div
                  className="w-6 rounded-md bg-primary/70 dark:bg-primary/80 transition"
                  style={{ height }}
                  title={`${Math.round(value / 60)} Min`}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                {Math.round(value / 60)}m
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
