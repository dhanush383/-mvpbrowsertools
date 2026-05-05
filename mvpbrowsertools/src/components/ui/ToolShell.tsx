import type { ReactNode } from "react";

interface ToolShellProps {
  title: string;
  summary: string;
  children: ReactNode;
}

export function ToolShell({ title, summary, children }: ToolShellProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6" aria-label={title}>
      <div className="mb-5 border-b border-slate-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Instant browser tool</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{summary}</p>
      </div>
      {children}
    </section>
  );
}
