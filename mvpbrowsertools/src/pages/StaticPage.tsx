import { SEO } from "../components/seo/SEO";
import type { StaticPageConfig } from "../types";

export function StaticPage({ page }: { page: StaticPageConfig }) {
  return (
    <>
      <SEO title={page.title} description={page.description} path={page.path} />
      <main id="main" className="page-shell prose-block py-12">
        <h1>{page.h1}</h1>
        {page.body.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </main>
    </>
  );
}
