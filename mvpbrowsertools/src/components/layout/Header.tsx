import { Menu, Search, Wrench, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Tools", path: "/sitemap" },
  { label: "Before Call", path: "/before-video-call-checklist" },
  { label: "Device Tests", path: "/webcam-test" },
  { label: "Before Upload", path: "/resize-image-for-online-form" },
  { label: "Screenshot Tools", path: "/blur-screenshot-online" },
  { label: "QR Tools", path: "/qr-code-generator" },
  { label: "Guides", path: "/image-upload-rejected-guide" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-950" aria-label="LaptopFixTools home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>LaptopFixTools</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/sitemap"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Find tools
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {open ? (
        <nav className="page-shell grid gap-2 pb-4 lg:hidden" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
