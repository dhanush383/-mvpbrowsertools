import {
  Camera,
  FileCheck,
  Gauge,
  Image as ImageIcon,
  Keyboard,
  LockKeyhole,
  Mic,
  MonitorUp,
  MousePointer2,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "../components/seo/SEO";
import { FAQSection } from "../components/ui/FAQSection";
import { ToolCard } from "../components/ui/ToolCard";
import { homeFaqs } from "../data/faqs";
import { categoryOrder, popularTools, toolPages } from "../data/tools";

const iconMap = {
  webcam: Camera,
  microphone: Mic,
  speaker: Volume2,
  keyboard: Keyboard,
  mouse: MousePointer2,
  "internet-speed": Gauge,
  "screen-recorder": MonitorUp,
  "image-compressor": ImageIcon,
  "image-resizer": ImageIcon,
  "file-size": FileCheck,
  "screenshot-editor": ShieldCheck,
  "screenshot-pdf": FileCheck,
  qr: QrCode,
  "send-link": Send,
  metadata: ShieldCheck,
  password: LockKeyhole,
  guide: Sparkles,
};

export function Home() {
  const [query, setQuery] = useState("");
  const searched = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return toolPages
      .filter((tool) => `${tool.navLabel} ${tool.primaryKeyword} ${tool.intro}`.toLowerCase().includes(term))
      .slice(0, 6);
  }, [query]);
  const popular = popularTools.map((path) => toolPages.find((tool) => tool.path === path)).filter(Boolean);

  return (
    <>
      <SEO
        title="LaptopFixTools - Instant Laptop Fixes in Your Browser"
        description="Test your camera and mic, compress files, create QR codes, clean screenshots, and prepare uploads. No login."
        path="/"
      />
      <main id="main">
        <section className="hero-band">
          <div className="page-shell grid min-h-[620px] items-center gap-10 py-14 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Test. Resize. Blur. Share. No login.</p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Fix Everyday Laptop Problems in Seconds
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Test your camera and mic, compress files, create QR codes, clean screenshots, and prepare uploads - all in your
                browser.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/webcam-test"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-700/20 hover:bg-teal-800"
                >
                  Start with Webcam Test
                </Link>
                <a
                  href="#tools"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Explore Tools
                </a>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/50">
              <div className="grid gap-3">
                {[
                  ["Camera", "Ready", "bg-emerald-100 text-emerald-800"],
                  ["Microphone", "Level moving", "bg-sky-100 text-sky-800"],
                  ["Image upload", "Under 100KB", "bg-amber-100 text-amber-900"],
                  ["Screenshot", "Private data blurred", "bg-rose-100 text-rose-800"],
                ].map(([label, value, classes]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <QrCode className="h-4 w-4" />
                  Link ready for phone
                </div>
                <div className="mt-4 grid grid-cols-9 gap-1">
                  {Array.from({ length: 81 }, (_, index) => (
                    <span key={index} className={`aspect-square rounded-sm ${index % 3 === 0 || index % 7 === 0 ? "bg-white" : "bg-white/20"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="page-shell py-12">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What do you need to fix?"
              className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-base shadow-sm"
              aria-label="Search tools"
            />
          </div>
          {searched.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {searched.map((tool) => (
                <Link key={tool.path} to={tool.path} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-teal-300">
                  {tool.navLabel}
                  <span className="mt-1 block font-normal text-slate-500">{tool.primaryKeyword}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        <section className="page-shell grid gap-5 py-8 md:grid-cols-2 xl:grid-cols-4">
          {categoryOrder.map((category) => {
            const tools = toolPages.filter((tool) => tool.category === category).slice(0, 4);
            return (
              <div key={category} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-950">{category}</h2>
                <div className="mt-4 space-y-2">
                  {tools.map((tool) => (
                    <Link key={tool.path} to={tool.path} className="block rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-800">
                      {tool.navLabel}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="page-shell py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Popular tools</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Quick fixes people use first</h2>
            </div>
          </div>
          <div className="tool-grid">
            {popular.map((tool) =>
              tool ? (
                <ToolCard
                  key={tool.path}
                  title={tool.navLabel}
                  description={tool.intro}
                  path={tool.path}
                  icon={iconMap[tool.kind]}
                />
              ) : null,
            )}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Why LaptopFixTools</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">Focused utilities for real laptop pressure</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["No login", "No install", "Browser-based", "Fast", "Private where possible", "Works on laptop and mobile"].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-shell prose-block py-14">
          <h2>Common laptop tasks this site is built for</h2>
          <p>
            LaptopFixTools is organized around moments when a small technical problem blocks a larger task. Before a meeting, you
            need to know whether the camera, microphone, speaker, and keyboard are working. Before an upload, you need file size,
            image dimensions, compression, and format checks. Before sharing, you may need to blur private screenshot details,
            convert screenshots to a PDF, or move a link from laptop to phone with a QR code.
          </p>
          <p>
            The site deliberately starts with a compact set of high-value tools and long-tail pages. That keeps the experience
            focused, fast, and easier to trust. Each page includes the working utility near the top, then practical instructions,
            common problems, privacy notes, FAQs, and related links for the next step in the same workflow.
          </p>
        </section>

        <section className="page-shell py-12">
          <FAQSection faqs={homeFaqs} />
        </section>
      </main>
    </>
  );
}
