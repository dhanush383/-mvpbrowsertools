import { expect, test } from "@playwright/test";

const baseUrl = "http://localhost:5173";

const routes = [
  "/",
  "/image-compressor",
  "/compress-image-to-50kb",
  "/compress-image-to-100kb",
  "/compress-image-to-200kb",
  "/compress-photo-to-100kb",
  "/compress-photo-to-200kb",
  "/compress-jpg-online",
  "/compress-png-online",
  "/compress-webp-online",
  "/reduce-image-size-online",
  "/photo-compressor-for-exam-form",
  "/compress-passport-size-photo",
  "/image-compressor-for-students",
  "/compress-photo-without-losing-quality",
  "/image-resizer",
  "/image-cropper",
  "/jpg-to-png",
  "/png-to-jpg",
  "/image-to-webp",
  "/webp-to-jpg",
  "/image-to-pdf",
  "/whatsapp-dp-resizer",
  "/instagram-image-resizer",
  "/youtube-thumbnail-resizer",
  "/passport-photo-maker",
  "/fix-my-image",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
];

test("home page renders key UI without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Free Online Image Tools" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Compress Image/ }).first()).toBeVisible();
  await expect(page.getByText("Ad Space below hero")).toBeVisible();
  await expect(page.locator(".vite-error-overlay")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("all public routes render content", async ({ page }) => {
  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await expect(page.locator("body")).toContainText("QuickImageFix");
    await expect(page.locator("main, section").first()).toBeVisible();
    await expect(page.locator(".vite-error-overlay")).toHaveCount(0);
  }
});

test("compressor processes a generated PNG in the browser", async ({ page }) => {
  const base64Png =
    "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABHklEQVR4nO3QQQ0AIBDAMMC/5+ONAvZoFSzZnplYkjf7uwN4G4IYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYgBiCGIAYwF4PcAW9mB0mVAAAAAElFTkSuQmCC";

  await page.goto(`${baseUrl}/image-compressor`, { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "sample.png",
    mimeType: "image/png",
    buffer: Buffer.from(base64Png, "base64"),
  });
  await page.getByRole("button", { name: /Compress Images/ }).click();
  await expect(page.getByRole("button", { name: "Download" })).toBeVisible({ timeout: 10000 });
});
