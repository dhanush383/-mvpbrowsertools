import { Camera, RefreshCcw, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getFriendlyMediaError, getMediaSupportError, stopMediaStream } from "../../lib/mediaSupport";
import { trackEvent } from "../../utils/analytics";

interface WebcamTestProps {
  label?: "webcam" | "camera";
}

export function WebcamTest({ label = "webcam" }: WebcamTestProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [deviceName, setDeviceName] = useState(`${label === "camera" ? "Camera" : "Webcam"} not started`);
  const [resolution, setResolution] = useState("Resolution appears after preview starts");
  const [error, setError] = useState("");

  const stopCamera = () => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setStarting(false);
    setResolution("Resolution appears after preview starts");
  };

  const startCamera = async () => {
    setError("");
    const supportError = getMediaSupportError("video");
    if (supportError) {
      setError(supportError);
      trackEvent("permission_denied", { tool: label, message: supportError });
      return;
    }
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      const message = "getUserMedia is not supported in this browser.";
      setError(message);
      trackEvent("permission_denied", { tool: label, message });
      return;
    }
    stopCamera();
    setStarting(true);
    try {
      trackEvent("tool_start", { tool: label });
      const stream = await mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const [track] = stream.getVideoTracks();
      setDeviceName(track?.label || "Camera permission granted");
      const settings = track?.getSettings?.();
      if (settings?.width && settings?.height) {
        setResolution(`${settings.width} x ${settings.height}`);
      }
      const updateResolution = () => {
        const video = videoRef.current;
        if (video?.videoWidth && video.videoHeight) {
          setResolution(`${video.videoWidth} x ${video.videoHeight}`);
        }
      };
      updateResolution();
      window.setTimeout(updateResolution, 400);
      setActive(true);
      trackEvent("tool_complete", { tool: label });
    } catch (caught) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      const message = getFriendlyMediaError(caught);
      setError(message);
      setActive(false);
      trackEvent("permission_denied", { tool: label, message });
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => stopCamera, []);

  const title = label === "camera" ? "camera" : "webcam";

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
        <video
          ref={videoRef}
          className={`aspect-video w-full bg-slate-950 object-cover ${mirror ? "-scale-x-100" : ""}`}
          playsInline
          muted
        />
      </div>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={active ? stopCamera : startCamera}
            disabled={starting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            {active ? <StopCircle className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {active ? "Stop camera" : starting ? "Starting..." : `Start ${title} test`}
          </button>
          <button
            type="button"
            onClick={() => setMirror((value) => !value)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            {mirror ? "Mirror on" : "Mirror off"}
          </button>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="font-semibold text-slate-900">Selected camera</dt>
            <dd className="mt-1 text-slate-600">{deviceName}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <dt className="font-semibold text-slate-900">Preview resolution</dt>
            <dd className="mt-1 text-slate-600">{resolution}</dd>
          </div>
        </dl>
        {error ? (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <p className="font-semibold">Camera could not start.</p>
            <p className="mt-1">{error}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Allow camera permission in browser site settings.</li>
              <li>Close apps that may already be using the webcam.</li>
              <li>Check a laptop privacy shutter or camera function key.</li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
