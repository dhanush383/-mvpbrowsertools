import { Download, ImageUp, RotateCcw, Undo2 } from "lucide-react";
import { type PointerEvent, useEffect, useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { canvasToBlob, cropCanvasToBox, normalizeBox, renderScreenshotEdits, type EditBox } from "../../utils/canvasTools";
import { downloadBlob, safeFilename } from "../../utils/fileUtils";

type Mode = "blur" | "redact" | "crop" | "annotate";

export function ScreenshotEditorTool({ mode = "blur" }: { mode?: Mode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [filename, setFilename] = useState("screenshot.png");
  const [boxes, setBoxes] = useState<EditBox[]>([]);
  const [preview, setPreview] = useState<EditBox | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const draw = (nextPreview = preview) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    renderScreenshotEdits(canvas, image, boxes, nextPreview);
  };

  useEffect(() => {
    draw();
  }, [boxes, preview]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onFile = (file: File | null) => {
    setError("");
    setBoxes([]);
    setPreview(null);
    setLoaded(false);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      imageRef.current = image;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        renderScreenshotEdits(canvas, image, [], null);
      }
      setFilename(file.name);
      setLoaded(true);
      trackEvent("tool_start", { tool: "screenshot-editor", mode });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Could not load this screenshot.");
    };
    image.src = url;
  };

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!loaded) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = point(event);
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!startRef.current || !loaded) return;
    const current = point(event);
    const next = normalizeBox(startRef.current.x, startRef.current.y, current.x, current.y);
    next.mode = mode === "crop" ? "annotate" : mode;
    setPreview(next);
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!startRef.current || !loaded) return;
    const current = point(event);
    const next = normalizeBox(startRef.current.x, startRef.current.y, current.x, current.y);
    startRef.current = null;
    if (next.width < 5 || next.height < 5) {
      setPreview(null);
      return;
    }
    if (mode === "crop") {
      next.mode = "annotate";
      setPreview(next);
      return;
    }
    next.mode = mode;
    setBoxes((currentBoxes) => [...currentBoxes, next]);
    setPreview(null);
    trackEvent("tool_complete", { tool: "screenshot-editor", mode });
  };

  const reset = () => {
    setBoxes([]);
    setPreview(null);
    draw(null);
  };

  const applyCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !preview) return;
    const cropped = cropCanvasToBox(canvas, preview);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      setBoxes([]);
      setPreview(null);
      renderScreenshotEdits(canvas, image, [], null);
      trackEvent("tool_complete", { tool: "screenshot-crop" });
    };
    image.src = cropped.toDataURL("image/png");
  };

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas, "image/png");
    downloadBlob(blob, safeFilename(filename, mode === "crop" ? "cropped" : "clean", "png"));
    trackEvent("download_click", { tool: "screenshot-editor", mode });
  };

  return (
    <div className="space-y-5">
      <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-teal-400 hover:bg-teal-50">
        <ImageUp className="h-7 w-7 text-teal-700" aria-hidden="true" />
        <span className="mt-2 text-sm font-semibold text-slate-900">Upload screenshot or image</span>
        <span className="mt-1 text-xs text-slate-500">Blur sensitive information before sharing screenshots.</span>
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <div className="overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-3">
        <canvas
          ref={canvasRef}
          className="mx-auto max-h-[620px] max-w-full cursor-crosshair rounded bg-white"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          aria-label="Screenshot canvas editor"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {mode === "crop" ? (
          <button
            type="button"
            onClick={() => void applyCrop()}
            disabled={!preview}
            className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply crop
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setBoxes((current) => current.slice(0, -1));
            setPreview(null);
          }}
          disabled={!boxes.length}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button
          type="button"
          onClick={() => void download()}
          disabled={!loaded}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
      </div>
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
