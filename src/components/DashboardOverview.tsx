import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { TagLegend } from "./TagLegend";
import type { AppState, LearningStep } from "../types";
import { useI18n } from "../context/I18nContext";
import { getTagColor } from "../utils/tagColors";
import { formatDuration } from "../utils/time";

type DashboardOverviewProps = {
  appState: AppState;
  currentStep: LearningStep | null;
  onOpenSection: (sectionId: string) => void;
};

export const DashboardOverview = ({
  appState,
  currentStep,
  onOpenSection,
}: DashboardOverviewProps) => {
  const { t } = useI18n();
  const recentSteps = [...appState.steps].slice(0, 3);
  const allTags = Array.from(
    new Set(appState.steps.flatMap((step) => step.tags))
  );

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4">
      <Card className="p-5 bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("dashboard.focusTitle")}
          </div>
          {currentStep ? (
            <div className="mt-3">
              <div className="text-lg font-semibold">{currentStep.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatDuration(currentStep.timeSpentInSeconds)} {t("dashboard.collected")}
              </div>
              {currentStep.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentStep.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2 py-0.5 text-xs ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Button variant="primary" onClick={() => onOpenSection("focus")} className="mt-4">
                {t("dashboard.focusButton")}
              </Button>
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.focusEmpty")}
            </div>
          )}
        </Card>
      <Card className="p-5 bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("dashboard.today")}
          </div>
          <div className="mt-3 text-3xl font-semibold">
            {Math.round(appState.totalTimeSeconds / 3600)}h
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t("dashboard.totalSinceStart")}
          </div>
          <Button variant="secondary" onClick={() => onOpenSection("stats")} className="mt-4">
            {t("dashboard.statsButton")}
          </Button>
        </Card>
      </div>
      <Card className="p-5 bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("dashboard.recentSteps")}
        </div>
        <div className="mt-3 grid gap-2">
          {recentSteps.length === 0 && (
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("steps.empty")}
            </div>
          )}
          {recentSteps.map((step) => (
            <div
              key={step.id}
              className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2"
            >
              <div className="font-semibold">{step.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatDuration(step.timeSpentInSeconds)}
              </div>
            </div>
          ))}
        </div>
        <Button variant="primary" onClick={() => onOpenSection("steps")} className="mt-4">
          {t("dashboard.allSteps")}
        </Button>
      </Card>
      <TagLegend tags={allTags} />
    </div>
  );
};
