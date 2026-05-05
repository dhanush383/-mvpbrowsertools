import { Download, ImageUp, Lock, Unlock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { downloadBlob, formatBytes } from "../../utils/fileUtils";
import { loadImageFile, resizeImage, type CompressedImageResult } from "../../utils/imageCompression";

type PresetKey = "passport" | "signature" | "form" | "custom" | "exam";

const presets: Record<PresetKey, { label: string; width: number; height: number }> = {
  passport: { label: "Passport photo", width: 413, height: 531 },
  signature: { label: "Signature", width: 300, height: 100 },
  form: { label: "Online form photo", width: 600, height: 600 },
  exam: { label: "Exam form photo", width: 300, height: 400 },
  custom: { label: "Custom", width: 800, height: 600 },
};

export function ImageResizerTool({ preset = "form" }: { preset?: PresetKey }) {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<{ width: number; height: number; size: number } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(preset);
  const [width, setWidth] = useState(presets[preset].width);
  const [height, setHeight] = useState(presets[preset].height);
  const [ratioLocked, setRatioLocked] = useState(true);
  const [result, setResult] = useState<CompressedImageResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const aspect = useMemo(() => (source ? source.width / source.height : width / height), [source, width, height]);

  const choosePreset = (key: PresetKey) => {
    setSelectedPreset(key);
    setWidth(presets[key].width);
    setHeight(presets[key].height);
  };

  const onFile = async (selected: File | null) => {
    setError("");
    setResult(null);
    setFile(selected);
    if (!selected) return;
    try {
      const loaded = await loadImageFile(selected);
      setSource({ width: loaded.width, height: loaded.height, size: selected.size });
      trackEvent("tool_start", { tool: "image-resizer", size: selected.size });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this image.");
    }
  };

  const resize = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (result?.url) URL.revokeObjectURL(result.url);
      const next = await resizeImage(file, width, height);
      setResult(next);
      trackEvent("tool_complete", { tool: "image-resizer", width, height });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Resize failed.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    choosePreset(preset);
  }, [preset]);

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
          <span className="mt-3 text-sm font-semibold text-slate-900">Upload image</span>
          <span className="mt-1 text-xs text-slate-500">Resize locally for forms, exams, photos, and signatures.</span>
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="space-y-4 rounded-lg bg-slate-50 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(presets) as PresetKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => choosePreset(key)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  selectedPreset === key ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {presets[key].label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-900">
              Width
              <input
                type="number"
                min={1}
                value={width}
                onChange={(event) => {
                  const next = Math.max(1, Number(event.target.value));
                  setWidth(next);
                  if (ratioLocked) setHeight(Math.max(1, Math.round(next / aspect)));
                }}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="text-sm font-semibold text-slate-900">
              Height
              <input
                type="number"
                min={1}
                value={height}
                onChange={(event) => {
                  const next = Math.max(1, Number(event.target.value));
                  setHeight(next);
                  if (ratioLocked) setWidth(Math.max(1, Math.round(next * aspect)));
                }}
                className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => setRatioLocked((value) => !value)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
          >
            {ratioLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {ratioLocked ? "Keep aspect ratio on" : "Keep aspect ratio off"}
          </button>
          <button
            type="button"
            onClick={() => void resize()}
            disabled={!file || busy}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Resizing..." : "Resize image"}
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Before</p>
          <p className="mt-2">{source ? `${source.width} x ${source.height} - ${formatBytes(source.size)}` : "Upload an image to see dimensions."}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">After</p>
          <p className="mt-2">{result ? `${result.width} x ${result.height} - ${formatBytes(result.blob.size)}` : `${width} x ${height} target`}</p>
        </div>
      </div>
      {result ? (
        <button
          type="button"
          onClick={() => {
            downloadBlob(result.blob, result.filename);
            trackEvent("download_click", { tool: "image-resizer" });
          }}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Download resized image
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
