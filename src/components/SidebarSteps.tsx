import { useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import type { LearningStep } from "../types";
import { formatDuration } from "../utils/time";
import { useI18n } from "../context/I18nContext";
import { getTagColor } from "../utils/tagColors";

type SidebarStepsProps = {
  steps: ReadonlyArray<LearningStep>;
  currentStepId: string | null;
  onAddStep: (title: string) => void;
  onSelectStep: (id: string) => void;
  onDeleteStep: (id: string) => void;
  globalQuery?: string;
};

export const SidebarSteps = ({
  steps,
  currentStepId,
  onAddStep,
  onSelectStep,
  onDeleteStep,
  globalQuery,
}: SidebarStepsProps) => {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [filterText, setFilterText] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const sortedSteps = useMemo(() => {
    return [...steps].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [steps]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    steps.forEach((step) => step.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [steps]);

  const visibleSteps = useMemo(() => {
    const combinedQuery = [filterText, globalQuery]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase();
    return sortedSteps.filter((step) => {
      const matchesTag = activeTag ? step.tags.includes(activeTag) : true;
      const matchesText = combinedQuery
        ? step.title.toLowerCase().includes(combinedQuery) ||
          step.notes.toLowerCase().includes(combinedQuery) ||
          step.tags.some((tag) => tag.toLowerCase().includes(combinedQuery))
        : true;
      return matchesTag && matchesText;
    });
  }, [sortedSteps, activeTag, filterText, globalQuery]);

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onAddStep(trimmed);
    setTitle("");
  };

  return (
    <Card className="p-4 flex flex-col h-full animate-fade-in bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
          <div className="flex gap-2 mb-4">
        <input
              className="flex-1 rounded-xl border border-border/80 dark:border-border-dark/80 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
          placeholder={t("steps.addPlaceholder")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAdd();
            }
          }}
        />
        <Button variant="primary" onClick={handleAdd}>
          + {t("steps.addButton")}
        </Button>
      </div>

      <div className="mb-3 space-y-2">
        <input
            className="w-full rounded-xl border border-border/80 dark:border-border-dark/80 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
          placeholder={t("steps.filterPlaceholder")}
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
        />
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeTag ? "ghost" : "primary"}
              onClick={() => setActiveTag(null)}
            >
              {t("steps.allTags")}
            </Button>
            {availableTags.map((tag) => (
              <Button
                key={tag}
                size="sm"
                variant={activeTag === tag ? "primary" : "ghost"}
                onClick={() => setActiveTag(tag)}
                className={activeTag === tag ? "" : getTagColor(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto space-y-3 pr-1 scrollbar">
        {visibleSteps.length === 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {steps.length === 0 ? t("steps.empty") : t("steps.emptyFiltered")}
          </div>
        )}
        {visibleSteps.map((step) => {
          const isActive = step.id === currentStepId;
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`w-full text-left rounded-2xl border px-3 py-3 shadow-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                isActive
                  ? "border-primary/60 bg-primary/10 dark:bg-primary/20 scale-[1.01] shadow-md"
                  : "border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 hover:shadow-lg hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDuration(step.timeSpentInSeconds)}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(step.createdAt).toLocaleString("de-DE")}
                  </div>
                  {step.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
              {step.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="text-xs text-danger hover:text-danger/80 transition"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteStep(step.id);
                  }}
                >
                  {t("steps.delete")}
                </button>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
