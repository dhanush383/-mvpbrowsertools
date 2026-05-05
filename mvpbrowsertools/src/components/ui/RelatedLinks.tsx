import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { RelatedLink } from "../../types";

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  return (
    <section aria-labelledby="related-tools-heading" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 id="related-tools-heading" className="text-xl font-semibold text-slate-950">
        Related tools and guides
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="group flex min-h-20 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:bg-teal-50"
          >
            <span>{link.label}</span>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
          </Link>
        ))}
      </div>
    </section>
  );
}
