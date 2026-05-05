import { Helmet } from "react-helmet-async";
import { canonicalUrl, organizationSchema } from "../../utils/seo";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  schema?: object[];
}

export function SEO({ title, description, path, schema = [] }: SEOProps) {
  const jsonLd = [organizationSchema, ...schema];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl(path)} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl(path)} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
