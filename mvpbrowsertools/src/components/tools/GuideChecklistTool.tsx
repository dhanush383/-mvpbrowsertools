import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function GuideChecklistTool({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <label key={item} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={checked.has(item)}
            onChange={(event) => {
              setChecked((current) => {
                const next = new Set(current);
                if (event.target.checked) next.add(item);
                else next.delete(item);
                return next;
              });
            }}
            className="mt-1 h-4 w-4 accent-teal-700"
          />
          <span className={checked.has(item) ? "text-slate-400 line-through" : ""}>{item}</span>
        </label>
      ))}
      <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-4 text-sm font-semibold text-teal-900">
        <CheckCircle2 className="h-5 w-5" />
        {checked.size} of {items.length} checks complete
      </div>
    </div>
  );
}
