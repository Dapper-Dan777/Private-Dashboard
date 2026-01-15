import { useEffect } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { useI18n } from "../context/I18nContext";

type SectionItem = { id: string; label: string };

type BurgerMenuProps = {
  isOpen: boolean;
  sections: ReadonlyArray<SectionItem>;
  currentSectionId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export const BurgerMenu = ({
  isOpen,
  sections,
  currentSectionId,
  onSelect,
  onClose,
}: BurgerMenuProps) => {
  const { t } = useI18n();
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <Card className="relative z-50 h-full w-72 p-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">{t("nav.title")}</div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2 overflow-auto scrollbar pr-1">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={section.id === currentSectionId ? "primary" : "ghost"}
              onClick={() => onSelect(section.id)}
              className="justify-start whitespace-nowrap"
            >
              {section.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
