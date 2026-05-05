export type OutputFormat = "original" | "jpeg" | "png" | "webp";

export type ToolKind =
  | "compressor"
  | "resizer"
  | "cropper"
  | "converter"
  | "pdf"
  | "social";

export type SocialPresetKey =
  | "square"
  | "whatsapp"
  | "instagram-post"
  | "instagram-story"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "passport";

export interface FAQ {
  question: string;
  answer: string;
}

export interface ToolPageConfig {
  path: string;
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  kind: ToolKind;
  defaultTargetKb?: number;
  defaultOutputFormat?: OutputFormat;
  socialPreset?: SocialPresetKey;
  howTo: string[];
  benefits: string[];
  faqs: FAQ[];
  related: string[];
}

export interface SeoCompressorPageConfig {
  path: string;
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  defaultTargetKb?: number;
  defaultOutputFormat?: OutputFormat;
  defaultQuality?: number;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  faqs: FAQ[];
}

export interface ProcessedFile {
  id: string;
  file: File;
  originalUrl: string;
  processedUrl?: string;
  processedBlob?: Blob;
  processedName?: string;
  originalWidth?: number;
  originalHeight?: number;
  outputWidth?: number;
  outputHeight?: number;
  error?: string;
}

export type LaptopToolKind =
  | "webcam"
  | "microphone"
  | "speaker"
  | "keyboard"
  | "mouse"
  | "internet-speed"
  | "screen-recorder"
  | "image-compressor"
  | "image-resizer"
  | "file-size"
  | "screenshot-editor"
  | "screenshot-pdf"
  | "qr"
  | "send-link"
  | "metadata"
  | "password"
  | "guide";

export type LaptopCategory =
  | "Before a Call"
  | "Before an Upload"
  | "Before Sharing"
  | "Safety & Privacy"
  | "Guides";

export interface RelatedLink {
  label: string;
  path: string;
}

export interface SeoPageSection {
  heading: string;
  body: string;
}

export interface LaptopPageConfig {
  path: string;
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  navLabel: string;
  category: LaptopCategory;
  kind: LaptopToolKind;
  primaryKeyword: string;
  scenario: string;
  audience: string;
  toolSummary: string;
  defaultTargetKb?: number;
  screenshotMode?: "blur" | "redact" | "crop" | "annotate";
  qrMode?: "url" | "text" | "wifi";
  resizerPreset?: "custom" | "passport" | "signature" | "form" | "exam";
  guideChecklist?: string[];
  howTo: string[];
  problems: string[];
  privacy: string;
  sections: SeoPageSection[];
  faqs: FAQ[];
  related: RelatedLink[];
}

export interface StaticPageConfig {
  path: string;
  title: string;
  description: string;
  h1: string;
  body: SeoPageSection[];
}

export type AnalyticsEventName =
  | "tool_start"
  | "tool_complete"
  | "download_click"
  | "copy_click"
  | "permission_denied"
  | "qr_generated";
