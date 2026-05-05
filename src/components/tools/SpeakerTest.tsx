import { Headphones, Square, Volume2, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../../utils/analytics";

type Channel = "both" | "left" | "right" | "headphones";

const speakerTests: Array<{ channel: Channel; label: string; icon: LucideIcon }> = [
  { channel: "both", label: "Both speakers", icon: Volume2 },
  { channel: "left", label: "Left speaker", icon: Volume2 },
  { channel: "right", label: "Right speaker", icon: Volume2 },
  { channel: "headphones", label: "Headphone mode", icon: Headphones },
];

const getAudioContextCtor = () => {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
};

export function SpeakerTest() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Ready. Lower volume before playing a tone.");
  const [error, setError] = useState("");

  const stopTone = (updateUi = true) => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close().catch(() => undefined);
    }
    audioContextRef.current = null;
    if (updateUi) {
      setActive(false);
      setStatus("Tone stopped.");
    }
  };

  const playTone = async (channel: Channel) => {
    setError("");
    const AudioContextCtor = getAudioContextCtor();
    if (!AudioContextCtor) {
      setError("Web Audio API is not available in this browser.");
      setStatus("Unsupported browser.");
      return;
    }

    stopTone(false);
    trackEvent("tool_start", { tool: "speaker", channel });
    const ctx = new AudioContextCtor();
    audioContextRef.current = ctx;
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    gain.gain.value = 0.08;
    panner.connect(gain);
    gain.connect(ctx.destination);

    const run = (pan: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 520;
      panner.pan.setValueAtTime(pan, ctx.currentTime + start);
      osc.connect(panner);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    setActive(true);
    if (channel === "headphones") {
      run(-1, 0, 0.55);
      run(1, 0.72, 0.55);
      setStatus("Headphone mode: left tone, then right tone.");
    } else {
      run(channel === "left" ? -1 : channel === "right" ? 1 : 0, 0, 1.2);
      setStatus(`Playing ${channel === "both" ? "both speakers" : `${channel} speaker`} test tone.`);
    }

    const timer = window.setTimeout(() => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close().catch(() => undefined);
      }
      audioContextRef.current = null;
      setActive(false);
      setStatus("Test finished. If you heard nothing, check output device and tab mute settings.");
      trackEvent("tool_complete", { tool: "speaker", channel });
    }, channel === "headphones" ? 1650 : 1400);
    timersRef.current.push(timer);
  };

  useEffect(() => () => stopTone(false), []);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-semibold">Volume warning</p>
        <p className="mt-1">Start with low system volume. This speaker test never asks for microphone permission.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {speakerTests.map(({ channel, label, icon: Icon }) => (
          <button
            key={channel}
            type="button"
            onClick={() => void playTone(channel)}
            disabled={active}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => stopTone()}
          disabled={!active}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Square className="h-4 w-4" />
          Stop tone
        </button>
      </div>
      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 lg:col-span-2" aria-live="polite">
        {status}
      </div>
      {error ? (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 lg:col-span-2">
          {error}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
        {["Check the selected output device.", "Confirm the browser tab is not muted.", "Reconnect Bluetooth or wired headphones."].map(
          (tip) => (
            <div key={tip} className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              {tip}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
