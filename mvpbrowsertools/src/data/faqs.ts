import type { FAQ } from "../types";

export const homeFaqs: FAQ[] = [
  {
    question: "What is LaptopFixTools?",
    answer:
      "LaptopFixTools is a focused collection of browser utilities for urgent laptop tasks: testing devices, preparing uploads, cleaning screenshots, creating QR codes, and generating passwords.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No. The MVP has no login, no payment flow, and no account dashboard.",
  },
  {
    question: "Are my files uploaded to a server?",
    answer:
      "Most tools process files locally in your browser using browser APIs such as Canvas, MediaDevices, Web Audio, and client-side PDF generation.",
  },
  {
    question: "Can I use it before a meeting?",
    answer:
      "Yes. The webcam, microphone, speaker, and keyboard tests are designed for quick checks before calls, interviews, online classes, and screen shares.",
  },
  {
    question: "Can I prepare form uploads here?",
    answer:
      "Yes. Use the image compressor, image resizer, signature resizer, passport photo resize page, and file size checker to prepare common portal uploads.",
  },
  {
    question: "Does LaptopFixTools work on mobile?",
    answer:
      "The site is responsive and many tools work on phones. Laptop hardware tests are still most useful on the laptop where the issue is happening.",
  },
  {
    question: "Will you add more tools?",
    answer:
      "The platform starts with a focused set of high-value tools. New tools should fit a real laptop workflow instead of turning the site into a generic tool directory.",
  },
  {
    question: "Is there advertising on the site?",
    answer:
      "There is no ad script in the MVP. The layout includes clean placeholder slots so ads can be added later without disrupting tool controls.",
  },
];
