# QuickImageFix

QuickImageFix is a free, browser-only React + Vite + TypeScript image tools website. It compresses, resizes, crops, converts, and fixes images without login, payment, uploads, or a backend.

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS with `@tailwindcss/vite`
- React Router DOM
- `react-helmet-async` for SEO metadata
- Canvas API for image processing
- `jsPDF` for image to PDF
- `JSZip` for batch downloads

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deploy on Vercel

1. Import the `quickimagefix` folder as a Vercel project.
2. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy.

## Deploy on Netlify

1. Add a new site from the `quickimagefix` folder.
2. Use:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy.

## Add AdSense Later

The reusable component is `src/components/AdSpace.tsx`.

Replace the placeholder contents with approved AdSense code after the site is accepted. Keep ads away from download buttons and do not create fake download buttons.

## Add New Tools or Pages

1. Add route metadata to `src/data/tools.ts`.
2. Create a reusable tool component in `src/components` when needed.
3. Add the tool kind rendering logic in `src/pages/ToolPage.tsx`.
4. Add related tools, FAQ content, benefits, and how-to steps.

## Update SEO Metadata

Tool SEO is controlled in `src/data/tools.ts`.

Each tool page should include:

- Unique title
- Unique meta description
- H1
- Intro paragraph
- FAQ entries for JSON-LD
- Related tools

The `SEO` component in `src/components/SEO.tsx` handles canonical URLs, Open Graph tags, Twitter card tags, and FAQ schema.

## Update Sitemap and Robots

When adding or removing public routes:

1. Update `public/sitemap.xml`.
2. Confirm `public/robots.txt` points to the correct sitemap URL.
3. Redeploy the site.

## Browser-Only Processing

Images are processed locally with browser APIs. There is no backend upload path in this project. Users should still keep original copies of important images before compression or resizing.
