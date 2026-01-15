import { useEffect, useMemo } from "react";
import type { AppState, ChatMessage } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useI18n } from "../../context/I18nContext";

type ImportPayload = {
  appState?: AppState;
  chatHistory?: ChatMessage[];
  settings?: {
    theme?: "light" | "dark";
    promptProfile?: "kurz" | "detail" | "quiz";
    historyLimit?: number;
  };
};

type ImportPreviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  payload: ImportPayload | null;
  onConfirm: (payload: ImportPayload) => void;
};

export const ImportPreviewDialog = ({
  isOpen,
  onClose,
  payload,
  onConfirm,
}: ImportPreviewDialogProps) => {
  const { t } = useI18n();
  const summary = useMemo(() => {
    if (!payload?.appState) {
      return null;
    }
    const steps = payload.appState.steps ?? [];
    const sessions = steps.reduce(
      (acc, step) => acc + (step.sessions?.length ?? 0),
      0
    );
    return {
      steps: steps.length,
      sessions,
      messages: payload.chatHistory?.length ?? 0,
    };
  }, [payload]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !payload) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <Card className="relative z-50 w-[520px] p-5 bg-surface/95 dark:bg-surface-dark/95 border border-border/60 dark:border-border-dark/60">
        <div className="text-lg font-semibold">{t("dialog.importTitle")}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {t("dialog.importHint")}
        </div>
        {summary && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Card variant="soft" className="p-3 text-center">
              <div className="text-xs text-slate-500">{t("dialog.importSteps")}</div>
              <div className="text-lg font-semibold">{summary.steps}</div>
            </Card>
            <Card variant="soft" className="p-3 text-center">
              <div className="text-xs text-slate-500">{t("dialog.importSessions")}</div>
              <div className="text-lg font-semibold">{summary.sessions}</div>
            </Card>
            <Card variant="soft" className="p-3 text-center">
              <div className="text-xs text-slate-500">{t("dialog.importChat")}</div>
              <div className="text-lg font-semibold">{summary.messages}</div>
            </Card>
          </div>
        )}
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {t("dialog.importReplace")}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("dialog.cancel")}
          </Button>
          <Button variant="danger" onClick={() => onConfirm(payload)}>
            {t("dialog.import")}
          </Button>
        </div>
      </Card>
    </div>
  );
};
