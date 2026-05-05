import { Copy, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { trackEvent } from "../../utils/analytics";

const sets = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

const generatePassword = (length: number, enabled: string[]) => {
  const source = enabled.join("");
  if (!source) return "";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => source[value % source.length]).join("");
};

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(18);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const enabledSets = useMemo(
    () =>
      Object.entries(options)
        .filter(([, enabled]) => enabled)
        .map(([key]) => sets[key as keyof typeof sets]),
    [options],
  );

  const strength = useMemo(() => {
    const variety = enabledSets.length;
    const score = Math.min(100, length * 4 + variety * 12);
    if (score >= 85) return { label: "Strong", color: "bg-emerald-500", width: "100%" };
    if (score >= 60) return { label: "Good", color: "bg-teal-500", width: "72%" };
    return { label: "Weak", color: "bg-amber-500", width: "42%" };
  }, [enabledSets.length, length]);

  const run = () => {
    const next = generatePassword(length, enabledSets);
    setPassword(next);
    setCopied(false);
    trackEvent("tool_complete", { tool: "password", length });
  };

  const copy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    trackEvent("copy_click", { tool: "password" });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="block text-sm font-semibold text-slate-900">
          Length: {length}
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
            className="range-slider mt-3 w-full"
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(options) as Array<keyof typeof options>).map((key) => (
          <label key={key} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.checked }))}
              className="h-4 w-4 accent-teal-700"
            />
            Include {key}
          </label>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="block text-sm font-semibold text-slate-900">
          Generated password
          <input
            value={password}
            readOnly
            className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-sm"
            placeholder="Generate locally"
          />
        </label>
        <div className="mt-4 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-teal-700" />
          <div className="h-3 flex-1 rounded-full bg-slate-100">
            <div className={`h-3 rounded-full ${strength.color}`} style={{ width: strength.width }} />
          </div>
          <span className="text-sm font-semibold text-slate-700">{strength.label}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={run}
          disabled={!enabledSets.length}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Generate password
        </button>
        <button
          type="button"
          onClick={() => void copy()}
          disabled={!password}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
