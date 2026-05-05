import { Download, MonitorUp, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getFriendlyMediaError, getMediaSupportError, stopMediaStream } from "../../lib/mediaSupport";
import { trackEvent } from "../../utils/analytics";
import { downloadBlob } from "../../utils/fileUtils";

export function ScreenRecorderTool() {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const previewUrlRef = useRef("");
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState("Ready to record your screen.");
  const [error, setError] = useState("");

  const clearPreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreviewUrl("");
    setRecordedBlob(null);
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
      return;
    }
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    setRecording(false);
    setStarting(false);
  };

  const startRecording = async () => {
    setError("");
    const supportError = getMediaSupportError("screen");
    if (supportError) {
      setError(supportError);
      trackEvent("permission_denied", { tool: "screen-recorder", message: supportError });
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      const message = "MediaRecorder is not supported in this browser.";
      setError(message);
      trackEvent("permission_denied", { tool: "screen-recorder", message });
      return;
    }
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getDisplayMedia) {
      const message = "Screen recording is not supported in this browser.";
      setError(message);
      trackEvent("permission_denied", { tool: "screen-recorder", message });
      return;
    }

    clearPreview();
    setStarting(true);
    setStatus("Waiting for screen permission...");
    try {
      trackEvent("tool_start", { tool: "screen-recorder" });
      const stream = await mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setRecordedBlob(blob);
        setRecording(false);
        setStarting(false);
        setStatus("Recording ready to preview and download.");
        stopMediaStream(streamRef.current);
        streamRef.current = null;
        trackEvent("tool_complete", { tool: "screen-recorder", size: blob.size });
      };
      stream.getTracks().forEach((track) => {
        track.onended = () => {
          if (recorder.state === "recording") recorder.stop();
        };
      });
      recorder.start();
      setRecording(true);
      setStarting(false);
      setStatus("Recording screen. Click Stop recording when finished.");
    } catch (caught) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      setStarting(false);
      setRecording(false);
      const message = getFriendlyMediaError(caught);
      setError(message);
      setStatus("Screen recording did not start.");
      trackEvent("permission_denied", { tool: "screen-recorder", message });
    }
  };

  useEffect(
    () => () => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      stopMediaStream(streamRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" aria-live="polite">
        {status}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void startRecording()}
          disabled={starting || recording}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MonitorUp className="h-4 w-4" />
          {starting ? "Starting..." : "Start screen recording"}
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={!recording}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Square className="h-4 w-4" />
          Stop recording
        </button>
        <button
          type="button"
          onClick={() => {
            if (!recordedBlob) return;
            downloadBlob(recordedBlob, "screen-recording.webm");
            trackEvent("download_click", { tool: "screen-recorder" });
          }}
          disabled={!recordedBlob}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download WebM
        </button>
      </div>
      {previewUrl ? (
        <video className="aspect-video w-full rounded-lg border border-slate-200 bg-slate-950" controls src={previewUrl}>
          <track kind="captions" />
        </video>
      ) : null}
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          {error}
        </div>
      ) : null}
    </div>
  );
}
