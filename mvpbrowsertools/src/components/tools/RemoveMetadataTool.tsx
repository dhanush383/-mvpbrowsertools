import { Download, ImageUp, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { canvasToBlob } from "../../utils/canvasTools";
import { downloadBlob, formatBytes, safeFilename } from "../../utils/fileUtils";

export function RemoveMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const [dimensions, setDimensions] = useState("");
  const [error, setError] = useState("");

  const process = (selected: File | null) => {
    setFile(selected);
    setResult(null);
    setError("");
    if (!selected) return;
    const url = URL.createObjectURL(selected);
    const image = new Image();
    image.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Canvas is not available.");
        return;
      }
      ctx.drawImage(image, 0, 0);
      const type = selected.type === "image/png" ? "image/png" : selected.type === "image/webp" ? "image/webp" : "image/jpeg";
      const blob = await canvasToBlob(canvas, type, 0.92);
      setResult(blob);
      setDimensions(`${image.naturalWidth} x ${image.naturalHeight}`);
      trackEvent("tool_complete", { tool: "metadata", size: blob.size });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Could not load this image.");
    };
    image.src = url;
  };

  return (
    <div className="space-y-5">
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-teal-400 hover:bg-teal-50">
        <ImageUp className="h-8 w-8 text-teal-700" aria-hidden="true" />
        <span className="mt-3 text-sm font-semibold text-slate-900">Upload image</span>
        <span className="mt-1 text-xs text-slate-500">Canvas export creates a fresh image without most embedded metadata.</span>
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => process(event.target.files?.[0] ?? null)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Original</p>
          <p className="mt-2">{file ? `${formatBytes(file.size)} - ${file.type || "unknown type"}` : "Upload an image to start."}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Clean copy</p>
          <p className="mt-2">{result ? `${formatBytes(result.size)} - ${dimensions}` : "Processed result appears here."}</p>
        </div>
      </div>
      {result && file ? (
        <button
          type="button"
          onClick={() => {
            const extension = result.type === "image/png" ? "png" : result.type === "image/webp" ? "webp" : "jpg";
            downloadBlob(result, safeFilename(file.name, "metadata-removed", extension));
            trackEvent("download_click", { tool: "metadata" });
          }}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Download clean image
        </button>
      ) : null}
      <div className="flex items-start gap-3 rounded-lg bg-teal-50 p-4 text-sm leading-6 text-teal-950">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        This removes most EXIF-style metadata because the browser redraws pixels to a new file. Always inspect sensitive images
        before sharing.
      </div>
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
