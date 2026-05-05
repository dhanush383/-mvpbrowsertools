import { Download, ImageUp, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { compressImageToTarget, loadImageFile, type CompressedImageResult } from "../../utils/imageCompression";
import { downloadBlob, formatBytes } from "../../utils/fileUtils";

interface ImageCompressorToolProps {
  defaultTargetKb?: number;
}

export function ImageCompressorTool({ defaultTargetKb = 100 }: ImageCompressorToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetKb, setTargetKb] = useState(defaultTargetKb);
  const [quality, setQuality] = useState(0.82);
  const [original, setOriginal] = useState<{ width: number; height: number; size: number } | null>(null);
  const [result, setResult] = useState<CompressedImageResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (selected: File | null) => {
    setError("");
    setResult(null);
    setFile(selected);
    if (!selected) return;
    try {
      const loaded = await loadImageFile(selected);
      setOriginal({ width: loaded.width, height: loaded.height, size: selected.size });
      trackEvent("tool_start", { tool: "image-compressor", size: selected.size });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read this image.");
    }
  };

  const compress = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (result?.url) URL.revokeObjectURL(result.url);
      const next = await compressImageToTarget(file, targetKb, quality);
      setResult(next);
      trackEvent("tool_complete", { tool: "image-compressor", targetKb, size: next.blob.size });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Compression failed.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!result) return;
    downloadBlob(result.blob, result.filename);
    trackEvent("download_click", { tool: "image-compressor" });
  };

  useEffect(() => {
    setTargetKb(defaultTargetKb);
  }, [defaultTargetKb]);

  useEffect(
    () => () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    },
    [result],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-teal-400 hover:bg-teal-50">
          <ImageUp className="h-8 w-8 text-teal-700" aria-hidden="true" />
          <span className="mt-3 text-sm font-semibold text-slate-900">Upload JPG, PNG, or WebP</span>
          <span className="mt-1 text-xs text-slate-500">Your image is processed in your browser.</span>
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="space-y-4 rounded-lg bg-slate-50 p-4">
          <label className="block text-sm font-semibold text-slate-900">
            Target size in KB
            <input
              type="number"
              min={5}
              max={2000}
              value={targetKb}
              onChange={(event) => setTargetKb(Number(event.target.value))}
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-900">
            Quality: {Math.round(quality * 100)}%
            <input
              type="range"
              min={30}
              max={98}
              value={Math.round(quality * 100)}
              onChange={(event) => setQuality(Number(event.target.value) / 100)}
              className="range-slider mt-3 w-full"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[20, 50, 100, 200].map((target) => (
              <button
                key={target}
                type="button"
                onClick={() => setTargetKb(target)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  targetKb === target ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {target}KB
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void compress()}
            disabled={!file || busy}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" />
            {busy ? "Compressing..." : "Auto-compress toward target"}
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Original</p>
          <p className="mt-2 text-sm text-slate-600">
            {original ? `${formatBytes(original.size)} - ${original.width} x ${original.height}` : "Upload an image to see details."}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Compressed</p>
          <p className="mt-2 text-sm text-slate-600">
            {result
              ? `${formatBytes(result.blob.size)} - ${result.width} x ${result.height} - quality ${Math.round(result.quality * 100)}%`
              : "Run compression to see output details."}
          </p>
        </div>
      </div>
      {result ? (
        <button
          type="button"
          onClick={download}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Download compressed image
        </button>
      ) : null}
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
