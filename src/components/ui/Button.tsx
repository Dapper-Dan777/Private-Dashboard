import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "rounded-lg font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.985]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft border border-transparent",
  secondary:
    "bg-surface-muted dark:bg-surface-mutedDark text-slate-800 dark:text-slate-100 border border-border/70 dark:border-border-dark/70 hover:bg-white dark:hover:bg-surface-dark/80 shadow-sm",
  ghost:
    "border border-border/60 dark:border-border-dark/60 bg-white/70 dark:bg-surface-mutedDark/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-surface-dark/70",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-soft",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export const Button = ({
  className,
  variant = "secondary",
  size = "md",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};
