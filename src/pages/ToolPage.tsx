import { Link } from "react-router-dom";
import { Breadcrumbs } from "../components/seo/Breadcrumbs";
import { SEO } from "../components/seo/SEO";
import { ToolRenderer } from "../components/tools/ToolRenderer";
import { AdSlot } from "../components/ui/AdSlot";
import { FAQSection } from "../components/ui/FAQSection";
import { RelatedLinks } from "../components/ui/RelatedLinks";
import { ToolShell } from "../components/ui/ToolShell";
import { brand } from "../data/tools";
import type { LaptopPageConfig } from "../types";
import { breadcrumbSchema, faqSchema, webApplicationSchema } from "../utils/seo";

export function ToolPage({ config }: { config: LaptopPageConfig }) {
  const breadcrumbs = [
    { label: "Home", path: "/" },
    { label: config.category, path: config.category === "Guides" ? "/before-video-call-checklist" : "/sitemap" },
    { label: config.h1, path: config.path },
  ];

  const schema = [
    breadcrumbSchema(breadcrumbs),
    faqSchema(config.faqs),
    ...(config.kind === "guide" ? [] : [webApplicationSchema(config.h1, config.description, config.path)]),
  ];

  return (
    <>
      <SEO title={config.title} description={config.description} path={config.path} schema={schema} />
      <main id="main">
        <Breadcrumbs items={breadcrumbs} />
        <div className="page-shell">
          <AdSlot label="Top banner advertisement space" />
        </div>
        <section className="page-shell grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{config.category}</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">{config.h1}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{config.intro}</p>
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Workflow fit</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{config.toolSummary}</p>
          </aside>
        </section>
        <section className="page-shell">
          <ToolShell title={config.h1} summary={config.toolSummary}>
            <ToolRenderer config={config} />
          </ToolShell>
          <AdSlot label="Advertisement space below tool" />
        </section>

        <article className="page-shell prose-block grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-8">
            <section>
              <h2>How to use {config.primaryKeyword}</h2>
              <ol>
                {config.howTo.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p>
                Keep the result visible until you have checked the next destination. For a call, that means opening the meeting
                app and choosing the same device. For an upload, it means comparing the final file size, type, and dimensions
                with the form instructions. For sharing, it means scanning, opening, downloading, or previewing the output before
                you send it to another person.
              </p>
            </section>

            <section>
              <h2>Common problems and fixes</h2>
              <ul>
                {config.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
              <p>
                Most laptop tasks fail for practical reasons: a permission prompt was blocked, a portal rounded file size
                differently, another app already controlled the device, or the source file did not match the requirement. The
                fastest fix is to change one thing at a time and retest. {brand.name} keeps related tools close so you can move
                from checking to fixing without searching through unrelated utilities.
              </p>
            </section>

            <section>
              <h2>Privacy and safety</h2>
              <p>{config.privacy}</p>
              <p>
                Local processing still deserves care. Review the final result before downloading, copying, scanning, or sending
                it. If you are working with school, workplace, medical, legal, or financial material, avoid selecting more data
                than the task requires. Browser permissions can be revoked from site settings after you finish camera or
                microphone tests.
              </p>
            </section>

            {config.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}

            <section>
              <h2>Why this page is focused on the long-tail task</h2>
              <p>
                Search terms like {config.primaryKeyword} usually come from someone with a specific problem, not someone browsing
                a toolbox for fun. A person may be minutes away from a video call, stuck on an exam form, trying to send a clean
                screenshot to support, or moving a link from a laptop to a phone. The page is therefore built around that single
                job first. The tool appears near the top, the instructions are written for the exact workflow, and the related
                links point to adjacent fixes rather than random utilities.
              </p>
              <p>
                This also helps performance. The app lazy-loads heavier browser tools, keeps the first route light, uses ordinary
                HTML content for crawlable instructions, and avoids requiring an account or paid API before the user can finish
                the task. That combination is important for Core Web Vitals and for people arriving from search who need an
                immediate answer.
              </p>
            </section>

            <AdSlot label="Advertisement space between content sections" />
            <RelatedLinks links={config.related} />
            <AdSlot label="Advertisement space before FAQ" />
            <FAQSection faqs={config.faqs} />
            <AdSlot label="Bottom advertisement space" />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Next useful step</h2>
              <div className="mt-3 space-y-2">
                {config.related.map((link) => (
                  <Link key={link.path} to={link.path} className="block rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <AdSlot label="Advertisement space" />
          </aside>
        </article>
      </main>
    </>
  );
}
