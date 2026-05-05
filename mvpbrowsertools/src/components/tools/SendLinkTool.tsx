import { Copy, Download, Smartphone } from "lucide-react";
import { useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { canvasToBlob } from "../../utils/canvasTools";
import { downloadBlob } from "../../utils/fileUtils";
import { createQr, drawQrToCanvas } from "../../utils/qrTools";

export function SendLinkTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("https://laptopfixtools.com");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generate = () => {
    setError("");
    setCopied(false);
    try {
      const value = url.trim();
      const qr = createQr(value);
      const canvas = canvasRef.current;
      if (canvas) drawQrToCanvas(canvas, qr.modules);
      setGenerated(value);
      trackEvent("qr_generated", { mode: "send-link" });
      trackEvent("tool_complete", { tool: "send-link" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate QR code.");
    }
  };

  const copy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    trackEvent("copy_click", { tool: "send-link" });
  };

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !generated) return;
    downloadBlob(await canvasToBlob(canvas, "image/png"), "link-to-phone-qr.png");
    trackEvent("download_click", { tool: "send-link" });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-900">
          Paste URL
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3"
            placeholder="https://example.com/page"
          />
        </label>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          No login, no app, and no backend file sharing in this MVP. The QR code only contains the link or text you enter.
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generate}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Smartphone className="h-4 w-4" />
            Generate phone QR
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            disabled={!generated}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={() => void download()}
            disabled={!generated}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download QR
          </button>
        </div>
        {error ? (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {error}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-4">
        <canvas ref={canvasRef} className="h-64 w-64 rounded" aria-label="Generated link QR code" />
      </div>
    </div>
  );
}
