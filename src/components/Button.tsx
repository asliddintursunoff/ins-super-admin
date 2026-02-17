import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
};

const styles: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

export function Button({ variant = "primary", loading, className = "", disabled, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        styles[variant],
        className,
      ].join(" ")}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" /> : null}
      {children}
    </button>
  );
}
