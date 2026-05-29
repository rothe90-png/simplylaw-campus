import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-brand-200 focus:bg-white/[0.1] focus:ring-4 focus:ring-brand/20";

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export function AdminTextInput({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  className
}: FieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <input
        className={fieldClass}
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function AdminTextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
  placeholder,
  className
}: FieldProps & { rows?: number }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <textarea
        className={cn(fieldClass, "min-h-28 resize-y")}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function AdminSelect({
  label,
  name,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; children: ReactNode }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <select className={fieldClass} name={name} {...props}>
        {children}
      </select>
    </label>
  );
}

export function AdminCheckbox({
  label,
  name,
  defaultChecked,
  className
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3", className)}>
      <input className="h-4 w-4 accent-brand" type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span className="text-sm font-bold text-slate-200">{label}</span>
    </label>
  );
}

export function AdminSubmitButton({
  children,
  className,
  type = "submit",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2f86ff,#004c91_45%,#5d3fd3)] px-5 text-sm font-bold text-white shadow-[0_18px_42px_rgba(0,76,145,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(0,76,145,0.38)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_18px_42px_rgba(0,76,145,0.28)]",
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminSecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
      href={href}
      prefetch={false}
    >
      {children}
    </Link>
  );
}
