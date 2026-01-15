import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import type { LearningStep } from "../types";
import { useI18n } from "../context/I18nContext";
import { getTagColor } from "../utils/tagColors";
import { formatDuration } from "../utils/time";

type StepDetailProps = {
  step: LearningStep | null;
  isTimerRunning: boolean;
  timerSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetPreset: (seconds: number) => void;
  onChangeNotes: (notes: string) => void;
  onChangeTags?: (tags: string[]) => void;
  quickNotes?: string[];
  onAddQuickNote?: (note: string) => void;
  onRemoveQuickNote?: (index: number) => void;
};

export const StepDetail = ({
  step,
  isTimerRunning,
  timerSeconds,
  onStart,
  onPause,
  onReset,
  onSetPreset,
  onChangeNotes,
  onChangeTags,
  quickNotes = [],
  onAddQuickNote,
  onRemoveQuickNote,
}: StepDetailProps) => {
  const { t } = useI18n();
  const [tagInput, setTagInput] = useState("");
  const [quickNoteInput, setQuickNoteInput] = useState("");

  useEffect(() => {
    if (step) {
      setTagInput(step.tags.join(", "));
    }
  }, [step]);

  const applyTags = (value: string) => {
    if (!onChangeTags) {
      return;
    }
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    onChangeTags(Array.from(new Set(tags)));
  };
  if (!step) {
    return (
      <Card className="p-6 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
        {t("focus.empty")}
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full flex flex-col gap-6 animate-fade-in bg-surface/95 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
          {step.title}
        </h2>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {t("focus.createdAt")} {new Date(step.createdAt).toLocaleString("de-DE")}
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t("focus.tags")}
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-border/80 dark:border-border-dark/80 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
            placeholder={t("focus.tagsPlaceholder")}
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onBlur={(event) => applyTags(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyTags(tagInput);
              }
            }}
            disabled={!onChangeTags}
          />
          {step.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {step.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-0.5 text-xs ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

          <Card variant="soft" className="p-5 shadow-sm transition-all">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {t("focus.timeLabel")}
        </div>
        <div className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-2 tracking-wide">
          {formatDuration(timerSeconds)}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="primary" onClick={onStart} disabled={isTimerRunning}>
            ▶ {t("focus.start")}
          </Button>
          <Button variant="primary" onClick={onPause} disabled={!isTimerRunning}>
            ⏸ {t("focus.pause")}
          </Button>
          <Button variant="secondary" onClick={onReset}>
            ⏹ {t("focus.reset")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[300, 900, 1800, 3600].map((preset) => (
            <Button
              key={preset}
              variant="ghost"
              size="sm"
              onClick={() => onSetPreset(preset)}
            >
              {preset / 60} min
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            📝 {t("focus.notesLabel")}
          </label>
          <textarea
            className="flex-1 min-h-[160px] rounded-2xl border border-border/80 dark:border-border-dark/80 bg-white/90 dark:bg-surface-mutedDark/80 p-3 text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
            value={step.notes}
            onChange={(event) => onChangeNotes(event.target.value)}
            placeholder={t("focus.notesPlaceholder")}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Card variant="soft" className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("focus.quickNotes")}
              </div>
              <span className="text-xs text-slate-400">{quickNotes.length}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-xl border border-border/80 dark:border-border-dark/80 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
                placeholder={t("focus.quickNotesPlaceholder")}
                value={quickNoteInput}
                onChange={(event) => setQuickNoteInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onAddQuickNote?.(quickNoteInput);
                    setQuickNoteInput("");
                  }
                }}
                disabled={!onAddQuickNote}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  onAddQuickNote?.(quickNoteInput);
                  setQuickNoteInput("");
                }}
                disabled={!quickNoteInput.trim()}
              >
                +
              </Button>
            </div>
            <div className="mt-3 space-y-2 max-h-36 overflow-auto scrollbar">
              {quickNotes.length === 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("focus.quickNotesEmpty")}
                </div>
              )}
              {quickNotes.map((note, index) => (
                <div
                  key={`${note}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/70 dark:bg-surface-mutedDark/70 px-3 py-2 text-xs"
                >
                  <span>{note}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveQuickNote?.(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </Card>
          <Card variant="soft" className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("focus.sessions")}
              </div>
              <span className="text-xs text-slate-400">{step.sessions.length}</span>
            </div>
            <div className="mt-2 space-y-2 max-h-40 overflow-auto scrollbar">
              {step.sessions.length === 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {t("focus.sessionsEmpty")}
                </div>
              )}
              {step.sessions
                .slice()
                .reverse()
                .slice(0, 6)
                .map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 px-2 py-1 text-xs"
                  >
                    <div className="font-semibold">
                      {formatDuration(session.durationSeconds)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(session.startAt).toLocaleString("de-DE")} →{" "}
                      {new Date(session.endAt).toLocaleTimeString("de-DE")}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};
