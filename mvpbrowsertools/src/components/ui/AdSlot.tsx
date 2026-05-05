interface AdSlotProps {
  label?: string;
}

export function AdSlot({ label = "Advertisement space" }: AdSlotProps) {
  return (
    <aside
      aria-label={label}
      className="my-8 flex min-h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-4 text-sm text-slate-500"
    >
      {label}
    </aside>
  );
}
