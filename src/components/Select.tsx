import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string };

export function Select({ label, className = "", children, ...rest }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        {...rest}
        className={[
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
          "outline-none focus:ring-2 focus:ring-slate-300",
          className,
        ].join(" ")}
      >
        {children}
      </select>
    </label>
  );
}
