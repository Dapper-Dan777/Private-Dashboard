import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "rounded-xl font-semibold whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] hover:scale-[1.02] hover:shadow-lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary via-primary-soft to-indigo-500 text-white hover:from-primary/90 hover:via-primary-soft/90 hover:to-indigo-600 shadow-md border border-primary/30 hover:border-primary/50 hover:shadow-xl",
  secondary:
    "bg-gradient-to-br from-surface-muted to-surface-muted/80 dark:from-surface-mutedDark dark:to-surface-mutedDark/80 text-slate-800 dark:text-slate-100 border border-border/70 dark:border-border-dark/70 hover:from-white hover:to-surface-muted dark:hover:from-surface-dark/90 dark:hover:to-surface-mutedDark shadow-sm hover:shadow-md",
  ghost:
    "border border-border/60 dark:border-border-dark/60 bg-gradient-to-br from-white/80 to-white/60 dark:from-surface-mutedDark/60 dark:to-surface-mutedDark/40 text-slate-700 dark:text-slate-200 hover:from-white hover:to-white/90 dark:hover:from-surface-dark/80 dark:hover:to-surface-dark/60 hover:border-border/80 dark:hover:border-border-dark/80",
  danger: "bg-gradient-to-r from-danger via-danger/90 to-red-600 text-white hover:from-danger/90 hover:via-danger/80 hover:to-red-700 shadow-md border border-danger/30 hover:border-danger/50 hover:shadow-xl",
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
