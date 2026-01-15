import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "rounded-xl font-semibold whitespace-nowrap transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-[#5c6df0] shadow-md hover:shadow-lg border border-primary/20 hover:border-primary/40",
  secondary:
    "bg-surface-muted dark:bg-surface-mutedDark text-slate-800 dark:text-slate-100 border border-border dark:border-border-dark hover:bg-surface dark:hover:bg-surface-dark shadow-sm hover:shadow-md",
  ghost:
    "border border-border/60 dark:border-border-dark/60 bg-white/70 dark:bg-surface-mutedDark/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-surface-dark/70 hover:border-border/80 dark:hover:border-border-dark/80",
  danger: "bg-danger text-white hover:bg-danger/90 shadow-md hover:shadow-lg border border-danger/20 hover:border-danger/40",
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
