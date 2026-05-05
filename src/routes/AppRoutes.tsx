import { Route, Routes } from "react-router-dom";
import { staticPages } from "../data/staticPages";
import { toolPages } from "../data/tools";
import { Home } from "../pages/Home";
import { NotFound } from "../pages/NotFound";
import { SitemapPage } from "../pages/SitemapPage";
import { StaticPage } from "../pages/StaticPage";
import { ToolPage } from "../pages/ToolPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {toolPages.map((tool) => (
        <Route key={tool.path} path={tool.path} element={<ToolPage config={tool} />} />
      ))}
      {staticPages.map((page) => (
        <Route key={page.path} path={page.path} element={<StaticPage page={page} />} />
      ))}
      <Route path="/sitemap" element={<SitemapPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
