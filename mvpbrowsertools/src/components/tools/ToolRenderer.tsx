import { lazy, Suspense } from "react";
import type { LaptopPageConfig } from "../../types";

const WebcamTest = lazy(() => import("./WebcamTest").then((module) => ({ default: module.WebcamTest })));
const MicrophoneTest = lazy(() => import("./MicrophoneTest").then((module) => ({ default: module.MicrophoneTest })));
const SpeakerTest = lazy(() => import("./SpeakerTest").then((module) => ({ default: module.SpeakerTest })));
const KeyboardTest = lazy(() => import("./KeyboardTest").then((module) => ({ default: module.KeyboardTest })));
const MouseTest = lazy(() => import("./MouseTest").then((module) => ({ default: module.MouseTest })));
const InternetSpeedTest = lazy(() => import("./InternetSpeedTest").then((module) => ({ default: module.InternetSpeedTest })));
const ScreenRecorderTool = lazy(() => import("./ScreenRecorderTool").then((module) => ({ default: module.ScreenRecorderTool })));
const ImageCompressorTool = lazy(() => import("./ImageCompressorTool").then((module) => ({ default: module.ImageCompressorTool })));
const ImageResizerTool = lazy(() => import("./ImageResizerTool").then((module) => ({ default: module.ImageResizerTool })));
const FileSizeChecker = lazy(() => import("./FileSizeChecker").then((module) => ({ default: module.FileSizeChecker })));
const ScreenshotEditorTool = lazy(() => import("./ScreenshotEditorTool").then((module) => ({ default: module.ScreenshotEditorTool })));
const ScreenshotToPdfTool = lazy(() => import("./ScreenshotToPdfTool").then((module) => ({ default: module.ScreenshotToPdfTool })));
const QrGeneratorTool = lazy(() => import("./QrGeneratorTool").then((module) => ({ default: module.QrGeneratorTool })));
const SendLinkTool = lazy(() => import("./SendLinkTool").then((module) => ({ default: module.SendLinkTool })));
const RemoveMetadataTool = lazy(() => import("./RemoveMetadataTool").then((module) => ({ default: module.RemoveMetadataTool })));
const PasswordGeneratorTool = lazy(() => import("./PasswordGeneratorTool").then((module) => ({ default: module.PasswordGeneratorTool })));
const GuideChecklistTool = lazy(() => import("./GuideChecklistTool").then((module) => ({ default: module.GuideChecklistTool })));

export function ToolRenderer({ config }: { config: LaptopPageConfig }) {
  let tool = null;
  switch (config.kind) {
    case "webcam":
      tool = <WebcamTest label={config.path.includes("camera") ? "camera" : "webcam"} />;
      break;
    case "microphone":
      tool = <MicrophoneTest />;
      break;
    case "speaker":
      tool = <SpeakerTest />;
      break;
    case "keyboard":
      tool = <KeyboardTest />;
      break;
    case "mouse":
      tool = <MouseTest />;
      break;
    case "internet-speed":
      tool = <InternetSpeedTest />;
      break;
    case "screen-recorder":
      tool = <ScreenRecorderTool />;
      break;
    case "image-compressor":
      tool = <ImageCompressorTool defaultTargetKb={config.defaultTargetKb} />;
      break;
    case "image-resizer":
      tool = <ImageResizerTool preset={config.resizerPreset ?? "form"} />;
      break;
    case "file-size":
      tool = <FileSizeChecker />;
      break;
    case "screenshot-editor":
      tool = <ScreenshotEditorTool mode={config.screenshotMode ?? "blur"} />;
      break;
    case "screenshot-pdf":
      tool = <ScreenshotToPdfTool />;
      break;
    case "qr":
      tool = <QrGeneratorTool defaultMode={config.qrMode ?? "url"} />;
      break;
    case "send-link":
      tool = <SendLinkTool />;
      break;
    case "metadata":
      tool = <RemoveMetadataTool />;
      break;
    case "password":
      tool = <PasswordGeneratorTool />;
      break;
    case "guide":
      tool = <GuideChecklistTool items={config.guideChecklist ?? config.howTo} />;
      break;
    default:
      tool = null;
  }

  return (
    <Suspense fallback={<div className="rounded-lg bg-slate-50 p-6 text-sm text-slate-600">Loading tool...</div>}>
      {tool}
    </Suspense>
  );
}
