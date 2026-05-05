import { Mic, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getFriendlyMediaError, getMediaSupportError, stopMediaStream } from "../../lib/mediaSupport";
import { trackEvent } from "../../utils/analytics";

export function MicrophoneTest() {
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const frameRef = useRef<number | null>(null);
  const playbackUrlRef = useRef("");
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [deviceName, setDeviceName] = useState("Microphone not started");
  const [level, setLevel] = useState(0);
  const [bars, setBars] = useState<number[]>(Array.from({ length: 24 }, () => 4));
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [error, setError] = useState("");

  const stopMeter = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  const stopMic = () => {
    stopMeter();
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close().catch(() => undefined);
    }
    audioContextRef.current = null;
    setActive(false);
    setStarting(false);
    setRecording(false);
    setLevel(0);
  };

  const startMic = async () => {
    setError("");
    const supportError = getMediaSupportError("audio");
    if (supportError) {
      setError(supportError);
      trackEvent("permission_denied", { tool: "microphone", message: supportError });
      return;
    }
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      const message = "getUserMedia is not supported in this browser.";
      setError(message);
      trackEvent("permission_denied", { tool: "microphone", message });
      return;
    }
    stopMic();
    setStarting(true);
    try {
      trackEvent("tool_start", { tool: "microphone" });
      const stream = await mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) throw new Error("Web Audio API is not available in this browser.");
      const audioContext = new AudioContextCtor();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setDeviceName(stream.getAudioTracks()[0]?.label || "Microphone permission granted");
      setActive(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        const samples = Array.from(data);
        samples.forEach((value) => {
          const normalized = (value - 128) / 128;
          sum += normalized * normalized;
        });
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(100, Math.round(rms * 180)));
        const step = Math.max(1, Math.floor(samples.length / 24));
        setBars(
          Array.from({ length: 24 }, (_, index) => {
            const value = Math.abs(samples[index * step] - 128);
            return Math.max(4, Math.min(56, value * 1.4));
          }),
        );
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
      trackEvent("tool_complete", { tool: "microphone" });
    } catch (caught) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close().catch(() => undefined);
      }
      audioContextRef.current = null;
      const message = getFriendlyMediaError(caught);
      setError(message);
      trackEvent("permission_denied", { tool: "microphone", message });
    } finally {
      setStarting(false);
    }
  };

  const recordSample = () => {
    if (!streamRef.current || recording) return;
    if (typeof MediaRecorder === "undefined") {
      setError("Audio recording is not supported in this browser.");
      return;
    }
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current);
      const url = URL.createObjectURL(blob);
      playbackUrlRef.current = url;
      setPlaybackUrl(url);
      setRecording(false);
      trackEvent("tool_complete", { tool: "microphone_recording" });
    };
    recorder.start();
    setRecording(true);
    window.setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, 5000);
  };

  useEffect(
    () => {
      return () => {
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
        stopMic();
        if (playbackUrlRef.current) URL.revokeObjectURL(playbackUrlRef.current);
      };
    },
    [],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <button
            type="button"
            onClick={active ? stopMic : startMic}
            disabled={starting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {active ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {active ? "Stop microphone" : starting ? "Starting..." : "Start mic test"}
          </button>
          <button
            type="button"
            onClick={recordSample}
            disabled={!active || recording || typeof MediaRecorder === "undefined"}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {recording ? "Recording 5 seconds" : "Record 5 seconds"}
          </button>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-900">Selected microphone</p>
          <p className="mt-1 text-slate-600">{deviceName}</p>
        </div>
        {playbackUrl ? (
          <audio className="w-full" controls src={playbackUrl}>
            <track kind="captions" />
          </audio>
        ) : null}
        {error ? (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <p className="font-semibold">Microphone could not start.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Live input level</span>
          <span className="text-sm text-teal-200">{level}%</span>
        </div>
        <div className="mt-4 h-4 rounded-full bg-white/10">
          <div className="h-4 rounded-full bg-teal-400 transition-[width]" style={{ width: `${level}%` }} />
        </div>
        <div className="mt-8 flex h-24 items-center gap-1" aria-label="Microphone waveform">
          {bars.map((height, index) => (
            <span
              key={index}
              className="flex-1 rounded-full bg-sky-300"
              style={{ height: `${height}px` }}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-slate-300">
          Speak normally. A healthy input should move while you talk and settle when the room is quiet.
        </p>
      </div>
    </div>
  );
}
