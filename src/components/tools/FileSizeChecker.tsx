import { FileCheck, FileUp } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "../../utils/analytics";
import { formatBytes, getExtension } from "../../utils/fileUtils";

export function FileSizeChecker() {
  const [file, setFile] = useState<File | null>(null);

  const suggestions = (selected: File) => {
    const notes: string[] = [];
    if (selected.size > 5 * 1024 * 1024) notes.push("Large for many online forms. Check whether compression or PDF limits apply.");
    if (selected.size > 1024 * 1024 && selected.type.startsWith("image/")) notes.push("Image is over 1MB. Resize or compress before strict uploads.");
    if (!selected.type) notes.push("MIME type is not reported by the browser. Confirm the extension is accepted by your portal.");
    if (selected.size < 200 * 1024) notes.push("Small enough for many form uploads, but still check required dimensions and format.");
    return notes.length ? notes : ["Looks reasonable. Compare this size with the exact limit shown by your upload form."];
  };

  return (
    <div className="space-y-5">
      <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-teal-400 hover:bg-teal-50">
        <FileUp className="h-8 w-8 text-teal-700" aria-hidden="true" />
        <span className="mt-3 text-sm font-semibold text-slate-900">Select any file</span>
        <span className="mt-1 text-xs text-slate-500">No upload to server. The browser reads local file details.</span>
        <input
          className="sr-only"
          type="file"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
            if (selected) trackEvent("tool_complete", { tool: "file-size", size: selected.size });
          }}
        />
      </label>
      {file ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Bytes</p>
            <p className="mt-2 text-lg font-semibold text-teal-700">{file.size.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">KB</p>
            <p className="mt-2 text-lg font-semibold text-teal-700">{(file.size / 1024).toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">MB</p>
            <p className="mt-2 text-lg font-semibold text-teal-700">{(file.size / 1024 / 1024).toFixed(3)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Type</p>
            <p className="mt-2 text-sm font-semibold text-teal-700">{file.type || `.${getExtension(file) || "unknown"}`}</p>
          </div>
        </div>
      ) : null}
      {file ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-950">Upload readiness suggestions</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {file.name} is {formatBytes(file.size)}.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            {suggestions(file).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
