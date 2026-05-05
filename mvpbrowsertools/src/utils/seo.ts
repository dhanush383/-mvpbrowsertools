import { brand } from "../data/tools";
import type { FAQ, RelatedLink } from "../types";

export const canonicalUrl = (path: string) => `${brand.baseUrl}${path === "/" ? "" : path}`;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  url: brand.baseUrl,
  slogan: brand.tagline,
};

export const breadcrumbSchema = (items: RelatedLink[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: canonicalUrl(item.path),
  })),
});

export const faqSchema = (faqs: FAQ[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const webApplicationSchema = (name: string, description: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  url: canonicalUrl(path),
  description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: brand.name,
    url: brand.baseUrl,
  },
});
