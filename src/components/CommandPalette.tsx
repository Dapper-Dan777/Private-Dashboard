import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useI18n } from "../context/I18nContext";

type CommandAction = {
  id: string;
  label: string;
  run: () => void;
};

type CommandPaletteProps = {
  isOpen: boolean;
  onClose: () => void;
  actions: ReadonlyArray<CommandAction>;
};

export const CommandPalette = ({
  isOpen,
  onClose,
  actions,
}: CommandPaletteProps) => {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const visibleActions = useMemo(() => {
    const q = query.toLowerCase();
    return actions.filter((action) => action.label.toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "Enter" && visibleActions[0]) {
        visibleActions[0].run();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, visibleActions]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <Card className="relative z-50 w-[480px] p-4 bg-surface/95 dark:bg-surface-dark/95 border border-border/60 dark:border-border-dark/60">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{t("command.title")}</div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        <input
          className="mt-3 w-full rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder={t("command.search")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
        <div className="mt-3 max-h-64 space-y-2 overflow-auto scrollbar pr-1">
          {visibleActions.length === 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t("command.empty")}
            </div>
          )}
          {visibleActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              onClick={() => {
                action.run();
                onClose();
              }}
              className="w-full justify-start whitespace-nowrap"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
