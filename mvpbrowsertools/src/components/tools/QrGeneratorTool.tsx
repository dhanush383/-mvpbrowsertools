import { Copy, Download, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { canvasToBlob } from "../../utils/canvasTools";
import { downloadBlob } from "../../utils/fileUtils";
import { createQr, drawQrToCanvas, wifiPayload } from "../../utils/qrTools";

type QrMode = "url" | "text" | "wifi";

export function QrGeneratorTool({ defaultMode = "url", compact = false }: { defaultMode?: QrMode; compact?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<QrMode>(defaultMode);
  const [url, setUrl] = useState("https://example.com");
  const [text, setText] = useState("LaptopFixTools");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState("WPA");
  const [encoded, setEncoded] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const content = () => {
    if (mode === "wifi") return wifiPayload(ssid, password, security);
    if (mode === "text") return text;
    return url.trim();
  };

  const generate = () => {
    setError("");
    setCopied(false);
    try {
      const value = content();
      const qr = createQr(value);
      const canvas = canvasRef.current;
      if (canvas) drawQrToCanvas(canvas, qr.modules);
      setEncoded(value);
      trackEvent("qr_generated", { mode, version: qr.version });
      trackEvent("tool_complete", { tool: "qr", mode });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate QR code.");
    }
  };

  const copy = async () => {
    if (!encoded) return;
    await navigator.clipboard.writeText(encoded);
    setCopied(true);
    trackEvent("copy_click", { tool: "qr", mode });
  };

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !encoded) return;
    const blob = await canvasToBlob(canvas, "image/png");
    downloadBlob(blob, `${mode}-qr-code.png`);
    trackEvent("download_click", { tool: "qr", mode });
  };

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  return (
    <div className={`grid gap-5 ${compact ? "" : "lg:grid-cols-[1fr_320px]"}`}>
      <div className="space-y-4">
        {!compact ? (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="QR code type">
            {[
              ["url", "URL"],
              ["text", "Text"],
              ["wifi", "Wi-Fi"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key as QrMode)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  mode === key ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
        {mode === "url" ? (
          <label className="block text-sm font-semibold text-slate-900">
            URL
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3"
              placeholder="https://example.com"
            />
          </label>
        ) : null}
        {mode === "text" ? (
          <label className="block text-sm font-semibold text-slate-900">
            Text
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3"
              placeholder="Type text to encode"
            />
          </label>
        ) : null}
        {mode === "wifi" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-900">
              Network name
              <input value={ssid} onChange={(event) => setSsid(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <label className="text-sm font-semibold text-slate-900">
              Password
              <input value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <label className="text-sm font-semibold text-slate-900">
              Security
              <select value={security} onChange={(event) => setSecurity(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No password</option>
              </select>
            </label>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generate}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <QrCode className="h-4 w-4" />
            Generate QR
          </button>
          <button
            type="button"
            onClick={() => void copy()}
            disabled={!encoded}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy text"}
          </button>
          <button
            type="button"
            onClick={() => void download()}
            disabled={!encoded}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-4">
        <canvas ref={canvasRef} className="h-64 w-64 rounded" aria-label="Generated QR code" />
      </div>
    </div>
  );
}
