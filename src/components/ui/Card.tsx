import type { HTMLAttributes } from "react";
import { cn } from "../../utils/classNames";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "soft";
};

const base =
  "rounded-2xl border border-border/60 dark:border-border-dark/60 shadow-soft backdrop-blur-sm transition-colors";

const variants: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "bg-surface/90 dark:bg-surface-dark/90",
  soft: "bg-surface-muted/70 dark:bg-surface-mutedDark/70",
};

export const Card = ({
  className,
  variant = "default",
  ...props
}: CardProps) => {
  return <div className={cn(base, variants[variant], className)} {...props} />;
};
