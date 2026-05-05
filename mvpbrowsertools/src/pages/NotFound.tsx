import { Link } from "react-router-dom";
import { SEO } from "../components/seo/SEO";

export function NotFound() {
  return (
    <>
      <SEO title="Page Not Found - LaptopFixTools" description="This LaptopFixTools page could not be found." path="/404" />
      <main id="main" className="page-shell py-16">
        <h1 className="text-4xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-4 max-w-xl text-slate-600">The page may have moved, or the URL may be typed incorrectly.</p>
        <Link
          to="/sitemap"
          className="mt-8 inline-flex h-11 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Browse sitemap
        </Link>
      </main>
    </>
  );
}
