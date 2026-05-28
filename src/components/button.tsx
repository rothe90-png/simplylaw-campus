import Link from "next/link";
import type { ComponentProps, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "glass";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-card hover:bg-brand-dark focus:ring-brand/20",
  secondary: "border border-line bg-white text-ink hover:border-brand hover:text-brand focus:ring-brand/15",
  ghost: "bg-transparent text-slate-700 hover:bg-brand-50 hover:text-brand focus:ring-brand/10",
  danger: "border border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 focus:ring-red-100",
  glass: "border border-white/10 bg-white/10 text-white shadow-card hover:bg-white/15 focus:ring-brand/20"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3 py-2 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base"
};

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps;

export function Button({ className, variant = "primary", size = "md", fullWidth, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-ui-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}

export type ButtonLinkProps = ComponentProps<typeof Link> & ButtonBaseProps;

export function ButtonLink({ className, variant = "primary", size = "md", fullWidth, prefetch = false, ...props }: ButtonLinkProps) {
  return (
    <Link
      prefetch={prefetch}
      className={cn(
        "inline-flex items-center justify-center rounded-ui-sm font-semibold transition focus:outline-none focus:ring-4",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
