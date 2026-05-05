import type { StaticPageConfig } from "../types";

export const staticPages: StaticPageConfig[] = [
  {
    path: "/about",
    title: "About LaptopFixTools - Browser Utilities for Laptop Tasks",
    description: "Learn about LaptopFixTools, a focused no-login browser utility site for everyday laptop fixes.",
    h1: "About LaptopFixTools",
    body: [
      {
        heading: "Built for urgent laptop tasks",
        body:
          "LaptopFixTools exists for the small but stressful moments that happen before a call, upload, submission, or share. The site starts with a focused MVP set of practical tools instead of chasing a massive directory of unrelated utilities.",
      },
      {
        heading: "Local-first approach",
        body:
          "Where browser APIs allow it, tools process files and device tests locally in the browser. That keeps the experience fast and avoids unnecessary backend work for one-time tasks.",
      },
      {
        heading: "SEO without clutter",
        body:
          "Each tool page is written around a real long-tail problem and includes useful instructions, common fixes, privacy notes, FAQ content, and internal links to adjacent workflows.",
      },
    ],
  },
  {
    path: "/contact",
    title: "Contact LaptopFixTools - Feedback and Support",
    description: "Contact LaptopFixTools with feedback, bug reports, tool suggestions, and privacy questions.",
    h1: "Contact LaptopFixTools",
    body: [
      {
        heading: "Feedback",
        body:
          "For MVP feedback, bug reports, tool suggestions, or privacy questions, contact the LaptopFixTools team at hello@laptopfixtools.com.",
      },
      {
        heading: "What to include",
        body:
          "If a tool is not working, include your browser name, operating system, the route you used, and what you expected to happen. Do not send private files unless specifically requested through a secure support process.",
      },
    ],
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy - LaptopFixTools",
    description: "Read the LaptopFixTools privacy policy for local browser processing, webcam and microphone permissions, future analytics, and ads.",
    h1: "Privacy Policy",
    body: [
      {
        heading: "Local browser processing",
        body:
          "Most LaptopFixTools utilities process files locally in your browser. Image compression, resizing, screenshot editing, file size checks, QR generation, and password generation are designed to work without uploading selected files to a backend server.",
      },
      {
        heading: "Webcam and microphone permissions",
        body:
          "Webcam and microphone access happens through your browser permission prompt. No webcam video or microphone recording is stored by the website. Stop buttons release active media streams when you are finished.",
      },
      {
        heading: "Analytics and ads",
        body:
          "The MVP does not include real analytics tracking code or Google AdSense scripts. If analytics, advertising, or other third-party services are added later, this policy can be updated to explain what data is collected and how it is used.",
      },
      {
        heading: "Your choices",
        body:
          "You can deny camera or microphone permission, clear browser site permissions, avoid selecting files, or close the page at any time. Browser permission controls remain under your browser and operating system settings.",
      },
    ],
  },
  {
    path: "/terms",
    title: "Terms of Use - LaptopFixTools",
    description: "Read the LaptopFixTools terms for no-login browser utilities, acceptable use, limitations, and user responsibility.",
    h1: "Terms of Use",
    body: [
      {
        heading: "Use at your own discretion",
        body:
          "LaptopFixTools provides browser utilities for everyday laptop preparation tasks. You are responsible for checking final files, generated passwords, QR codes, screenshots, and device test results before relying on them.",
      },
      {
        heading: "No guarantee of acceptance",
        body:
          "Upload portals, meeting apps, browsers, and devices can apply their own rules. A file that appears ready in LaptopFixTools may still be rejected by another site if that site has additional requirements.",
      },
      {
        heading: "No prohibited use",
        body:
          "Do not use the site to create, hide, or distribute harmful, illegal, or deceptive material. The tools are intended for legitimate productivity, privacy, accessibility, and troubleshooting workflows.",
      },
    ],
  },
];

export const findStaticPage = (path: string) => staticPages.find((page) => page.path === path);
