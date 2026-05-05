import { Link } from "react-router-dom";
import type { RelatedLink } from "../../types";

interface BreadcrumbsProps {
  items: RelatedLink[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="page-shell pt-6 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.path}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {index === items.length - 1 ? (
              <span className="font-medium text-slate-700">{item.label}</span>
            ) : (
              <Link className="hover:text-teal-700" to={item.path}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
