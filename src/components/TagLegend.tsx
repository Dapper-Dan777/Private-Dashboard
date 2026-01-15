import { Card } from "./ui/Card";
import { useI18n } from "../context/I18nContext";
import { getTagColor } from "../utils/tagColors";

type TagLegendProps = {
  tags: ReadonlyArray<string>;
};

export const TagLegend = ({ tags }: TagLegendProps) => {
  const { t } = useI18n();
  if (tags.length === 0) {
    return null;
  }

  return (
    <Card variant="soft" className="p-3 bg-surface/90 dark:bg-surface-dark/90 border border-border/60 dark:border-border-dark/60">
      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
        {t("steps.allTags")}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-2 py-0.5 text-xs ${getTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
};
