import type { HTMLAttributes } from "react";
import { cn } from "../../utils/classNames";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "soft";
};

const base =
  "rounded-2xl border border-border/60 dark:border-border-dark/60 shadow-soft backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5";

const variants: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "bg-gradient-to-br from-surface/95 via-surface/90 to-surface-muted/50 dark:from-surface-dark/95 dark:via-surface-dark/90 dark:to-surface-mutedDark/50",
  soft: "bg-gradient-to-br from-surface-muted/80 via-surface-muted/70 to-surface-muted/60 dark:from-surface-mutedDark/80 dark:via-surface-mutedDark/70 dark:to-surface-mutedDark/60",
};

export const Card = ({
  className,
  variant = "default",
  ...props
}: CardProps) => {
  return <div className={cn(base, variants[variant], className)} {...props} />;
};
