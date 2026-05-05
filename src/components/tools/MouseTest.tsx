import { MousePointer2, RotateCcw } from "lucide-react";
import { useState, type MouseEvent, type PointerEvent, type WheelEvent } from "react";
import { trackEvent } from "../../utils/analytics";

export function MouseTest() {
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [middle, setMiddle] = useState(0);
  const [scrollUp, setScrollUp] = useState(0);
  const [scrollDown, setScrollDown] = useState(0);
  const [doubleClicks, setDoubleClicks] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [inside, setInside] = useState(false);

  const reset = () => {
    setLeft(0);
    setRight(0);
    setMiddle(0);
    setScrollUp(0);
    setScrollDown(0);
    setDoubleClicks(0);
    setPosition({ x: 0, y: 0 });
    setInside(false);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setInside(true);
    setPosition({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
    });
  };

  const click = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button === 0) setLeft((value) => value + 1);
    if (event.button === 1) setMiddle((value) => value + 1);
    if (event.button === 2) setRight((value) => value + 1);
    trackEvent("tool_complete", { tool: "mouse", button: event.button });
  };

  const wheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.deltaY < 0) setScrollUp((value) => value + 1);
    if (event.deltaY > 0) setScrollDown((value) => value + 1);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Left clicks", left],
          ["Right clicks", right],
          ["Middle clicks", middle],
          ["Double clicks", doubleClicks],
          ["Scroll up", scrollUp],
          ["Scroll down", scrollDown],
          ["Cursor X", position.x],
          ["Cursor Y", position.y],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{label}</p>
            <p className="mt-1 text-lg font-semibold text-teal-700">{value}</p>
          </div>
        ))}
      </div>
      <div
        className="relative flex min-h-72 touch-none select-none items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-4 text-center text-white"
        onPointerMove={move}
        onPointerLeave={() => setInside(false)}
        onMouseDown={click}
        onDoubleClick={() => setDoubleClicks((value) => value + 1)}
        onWheel={wheel}
        onContextMenu={(event) => event.preventDefault()}
        role="application"
        tabIndex={0}
        aria-label="Mouse test movement and click area"
      >
        <div>
          <MousePointer2 className="mx-auto h-8 w-8 text-teal-300" />
          <p className="mt-3 font-semibold">Move, click, right-click, middle-click, double-click, and scroll here</p>
          <p className="mt-2 text-sm text-slate-300">Context menu is disabled only inside this test area.</p>
        </div>
        {inside ? (
          <span
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal-300 bg-teal-300/30"
            style={{ left: position.x, top: position.y }}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <RotateCcw className="h-4 w-4" />
        Reset mouse test
      </button>
    </div>
  );
}
