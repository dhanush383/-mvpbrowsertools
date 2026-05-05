import { Gauge, RotateCcw } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "../../utils/analytics";

interface SpeedResult {
  latency: number;
  downloadMbps: number;
  transferredKb: number;
  durationMs: number;
}

const fetchAsset = async (path: string) => {
  const response = await fetch(`${path}?speed=${Date.now()}-${Math.random().toString(36).slice(2)}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not fetch test asset.");
  return response.blob();
};

export function InternetSpeedTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [error, setError] = useState("");

  const runTest = async () => {
    setTesting(true);
    setError("");
    setResult(null);
    try {
      trackEvent("tool_start", { tool: "internet-speed" });
      const latencySamples: number[] = [];
      for (let i = 0; i < 3; i += 1) {
        const start = performance.now();
        await fetchAsset("/favicon.svg");
        latencySamples.push(performance.now() - start);
      }

      const downloadStart = performance.now();
      const blobs = await Promise.all([
        fetchAsset("/og-image.svg"),
        fetchAsset("/sitemap.xml"),
        fetchAsset("/og-image.svg"),
        fetchAsset("/sitemap.xml"),
        fetchAsset("/og-image.svg"),
      ]);
      const durationMs = Math.max(1, performance.now() - downloadStart);
      const bytes = blobs.reduce((total, blob) => total + blob.size, 0);
      const downloadMbps = (bytes * 8) / (durationMs / 1000) / 1_000_000;
      const latency = latencySamples.reduce((sum, value) => sum + value, 0) / latencySamples.length;
      const next = {
        latency: Math.round(latency),
        downloadMbps: Number(downloadMbps.toFixed(2)),
        transferredKb: Number((bytes / 1024).toFixed(1)),
        durationMs: Math.round(durationMs),
      };
      setResult(next);
      trackEvent("tool_complete", { tool: "internet-speed", mbps: next.downloadMbps });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not run the speed estimate.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Latency estimate</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{result ? `${result.latency} ms` : "-"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Download estimate</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{result ? `${result.downloadMbps} Mbps` : "-"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Data sampled</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{result ? `${result.transferredKb} KB` : "-"}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Test time</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{result ? `${result.durationMs} ms` : "-"}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void runTest()}
          disabled={testing}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Gauge className="h-4 w-4" />
          {testing ? "Testing..." : "Start speed estimate"}
        </button>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setError("");
          }}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        This is an approximate browser-based speed estimate. Real speed test services use larger files and nearby servers, so use
        this result as a quick signal, not a certified measurement.
      </p>
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
