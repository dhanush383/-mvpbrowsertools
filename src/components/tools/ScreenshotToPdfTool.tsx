import { ArrowDown, ArrowUp, Download, FilePlus2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { formatBytes } from "../../utils/fileUtils";

interface PdfImage {
  id: string;
  file: File;
  url: string;
}

const readDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });

const imageSize = (src: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = src;
  });

export function ScreenshotToPdfTool() {
  const [images, setImages] = useState<PdfImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const urlsRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      urlsRef.current.push(url);
      return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        url,
      };
    });
    setImages((current) => [...current, ...next]);
    if (next.length) trackEvent("tool_start", { tool: "screenshot-pdf", count: next.length });
  };

  const move = (index: number, direction: -1 | 1) => {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const generate = async () => {
    if (!images.length) return;
    setBusy(true);
    setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 32;
      for (let index = 0; index < images.length; index += 1) {
        if (index > 0) pdf.addPage();
        const dataUrl = await readDataUrl(images[index].file);
        const size = await imageSize(dataUrl);
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;
        const scale = Math.min(maxWidth / size.width, maxHeight / size.height);
        const width = size.width * scale;
        const height = size.height * scale;
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        const format = images[index].file.type === "image/png" ? "PNG" : "JPEG";
        pdf.addImage(dataUrl, format, x, y, width, height);
      }
      pdf.save("screenshots.pdf");
      trackEvent("download_click", { tool: "screenshot-pdf", count: images.length });
      trackEvent("tool_complete", { tool: "screenshot-pdf" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-teal-400 hover:bg-teal-50">
        <FilePlus2 className="h-8 w-8 text-teal-700" aria-hidden="true" />
        <span className="mt-3 text-sm font-semibold text-slate-900">Upload screenshots</span>
        <span className="mt-1 text-xs text-slate-500">Select one or multiple images. PDF generation happens in your browser.</span>
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => addFiles(event.target.files)}
        />
      </label>
      {images.length ? (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={image.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <img src={image.url} alt="" className="h-14 w-20 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{image.file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(image.file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => move(index, -1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
                aria-label="Move image up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
                aria-label="Move image down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => void generate()}
        disabled={!images.length || busy}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {busy ? "Generating PDF..." : "Convert screenshots to PDF"}
      </button>
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
