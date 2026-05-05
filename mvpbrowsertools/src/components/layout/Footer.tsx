import { Link } from "react-router-dom";

const columns = [
  {
    title: "Popular tools",
    links: [
      ["Webcam Test", "/webcam-test"],
      ["Microphone Test", "/microphone-test"],
      ["Speaker Test", "/speaker-test"],
      ["Keyboard Test", "/keyboard-test"],
      ["Mouse Test", "/mouse-test"],
      ["Screen Recorder", "/screen-recorder"],
      ["Compress Image to 100KB", "/compress-image-to-100kb"],
    ],
  },
  {
    title: "Guides",
    links: [
      ["Before Video Call Checklist", "/before-video-call-checklist"],
      ["Camera Not Working", "/camera-not-working-guide"],
      ["Microphone Not Working", "/microphone-not-working-guide"],
      ["Image Upload Rejected", "/image-upload-rejected-guide"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Privacy Policy", "/privacy-policy"],
      ["Terms", "/terms"],
      ["Sitemap", "/sitemap"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-white">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="text-lg font-semibold">
            LaptopFixTools
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
            Instant laptop fixes in your browser. Test. Resize. Blur. Share. No login.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold text-white">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map(([label, path]) => (
                <li key={path}>
                  <Link className="text-sm text-slate-300 hover:text-white" to={path}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="page-shell text-xs text-slate-400">Copyright 2026 LaptopFixTools. Browser utilities for everyday laptop tasks.</p>
      </div>
    </footer>
  );
}
