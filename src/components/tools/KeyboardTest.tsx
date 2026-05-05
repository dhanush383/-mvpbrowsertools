import { Keyboard, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "../../utils/analytics";

const rows = [
  ["Escape", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
  ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
  ["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"],
  ["CapsLock", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Enter"],
  ["ShiftLeft", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
  ["ControlLeft", "MetaLeft", "AltLeft", "Space", "AltRight", "ControlRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowRight"],
];

const labels: Record<string, string> = {
  Escape: "Esc",
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  Backspace: "Back",
  BracketLeft: "[",
  BracketRight: "]",
  CapsLock: "Caps",
  Semicolon: ";",
  Quote: "'",
  Enter: "Enter",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  ControlLeft: "Ctrl",
  ControlRight: "Ctrl",
  MetaLeft: "Win",
  AltLeft: "Alt",
  AltRight: "Alt",
  Space: "Space",
  ArrowLeft: "Left",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowRight: "Right",
  Comma: ",",
  Period: ".",
  Slash: "/",
};

const keyLabel = (code: string) => labels[code] ?? code.replace("Key", "").replace("Digit", "");

export function KeyboardTest() {
  const [pressed, setPressed] = useState<Set<string>>(() => new Set());
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [last, setLast] = useState({ key: "None yet", keyCode: "None yet", code: "None yet", location: "None yet" });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!started) setStarted(true);
      setPressed((current) => new Set(current).add(event.code));
      setSeen((current) => new Set(current).add(event.code || event.key || "Unidentified"));
      setLast({
        key: event.key || "Unidentified",
        keyCode: String(event.keyCode || event.which || "Unknown"),
        code: event.code || "Unidentified",
        location: String(event.location),
      });
      trackEvent("tool_start", { tool: "keyboard", code: event.code });
    };
    const up = (event: KeyboardEvent) => {
      setPressed((current) => {
        const next = new Set(current);
        next.delete(event.code);
        return next;
      });
      trackEvent("tool_complete", { tool: "keyboard", code: event.code });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [started]);

  const count = useMemo(() => pressed.size, [pressed]);
  const reset = () => {
    setPressed(new Set());
    setSeen(new Set());
    setLast({ key: "None yet", keyCode: "None yet", code: "None yet", location: "None yet" });
    setStarted(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Key name</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{last.key}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Key code</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{last.keyCode}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Event code</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{last.code}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Location</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{last.location}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Pressed now</p>
          <p className="mt-1 text-lg font-semibold text-teal-700">{count}</p>
        </div>
      </div>
      <div
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 focus:outline-none focus:ring-4 focus:ring-teal-200"
        aria-label="Keyboard tester area"
      >
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Keyboard className="h-4 w-4" />
          Click here, then press keys
        </div>
        <div className="min-w-[860px] space-y-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((code) => {
                const wide = ["Backspace", "CapsLock", "Enter", "ShiftLeft", "ShiftRight", "Space", "Tab"].includes(code);
                return (
                  <span
                    key={code}
                    className={`flex h-11 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                      pressed.has(code)
                        ? "border-teal-300 bg-teal-300 text-slate-950"
                        : seen.has(code)
                          ? "border-sky-300 bg-sky-200 text-slate-950"
                        : "border-white/10 bg-white/10 text-slate-200"
                    } ${wide ? (code === "Space" ? "w-64" : "w-24") : "w-14"}`}
                  >
                    {keyLabel(code)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <RotateCcw className="h-4 w-4" />
        Reset keyboard test
      </button>
      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
        Browser keyboard events may not detect some system keys, media keys, BIOS keys, or shortcuts captured by your operating
        system before they reach the page. On mobile, tap into the tester and use the on-screen keyboard where supported.
      </p>
    </div>
  );
}
