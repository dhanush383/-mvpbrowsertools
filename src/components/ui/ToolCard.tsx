import { ArrowRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export function ToolCard({ title, description, path, icon: Icon }: ToolCardProps) {
  return (
    <Link
      to={path}
      className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg"
    >
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold text-slate-950">{title}</span>
      <span className="mt-2 flex-1 text-sm leading-6 text-slate-600">{description}</span>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
        Open tool <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
