import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useI18n } from "../../context/I18nContext";

type NewStepDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
};

export const NewStepDialog = ({ isOpen, onClose, onCreate }: NewStepDialogProps) => {
  const { t } = useI18n();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const trimmed = title.trim();
        if (trimmed) {
          onCreate(trimmed);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, onCreate, title]);

  if (!isOpen) {
    return null;
  }

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onCreate(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <Card className="relative z-50 w-[420px] p-5 bg-surface/95 dark:bg-surface-dark/95 border border-border/60 dark:border-border-dark/60">
        <div className="text-lg font-semibold">{t("dialog.newStepTitle")}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {t("dialog.newStepHint")}
        </div>
        <input
          className="mt-3 w-full rounded-xl border border-border/70 dark:border-border-dark/70 bg-white/90 dark:bg-surface-mutedDark/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder={t("steps.addPlaceholder")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("dialog.cancel")}
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={!title.trim()}>
            {t("dialog.create")}
          </Button>
        </div>
      </Card>
    </div>
  );
};
