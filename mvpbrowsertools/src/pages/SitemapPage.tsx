import { Link } from "react-router-dom";
import { SEO } from "../components/seo/SEO";
import { categoryOrder, toolPages } from "../data/tools";

export function SitemapPage() {
  const guidePages = toolPages.filter((tool) => tool.category === "Guides");
  return (
    <>
      <SEO
        title="Sitemap - LaptopFixTools"
        description="Browse all LaptopFixTools public pages, tools, guides, and legal pages."
        path="/sitemap"
      />
      <main id="main" className="page-shell py-12">
        <h1 className="text-4xl font-bold text-slate-950">Sitemap</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Browse every live LaptopFixTools route. This page mirrors the XML sitemap and keeps public tools easy to discover.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {categoryOrder.map((category) => (
            <section key={category} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{category}</h2>
              <ul className="mt-4 grid gap-2">
                {toolPages
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <li key={tool.path}>
                      <Link to={tool.path} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                        {tool.h1}
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Guides</h2>
            <ul className="mt-4 grid gap-2">
              {guidePages.map((tool) => (
                <li key={tool.path}>
                  <Link to={tool.path} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                    {tool.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Static pages</h2>
            <ul className="mt-4 grid gap-2">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Privacy Policy", "/privacy-policy"],
                ["Terms", "/terms"],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
