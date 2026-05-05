export type MediaSupportType = "audio" | "video" | "screen";

export const getMediaSupportError = (type: MediaSupportType) => {
  if (typeof window === "undefined") return "This tool only works in a browser.";
  if (!window.isSecureContext) return "Camera and microphone access require HTTPS.";
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    return "Your browser does not support media device access.";
  }
  if ((type === "audio" || type === "video") && typeof navigator.mediaDevices.getUserMedia !== "function") {
    return "getUserMedia is not supported in this browser.";
  }
  if (type === "screen" && typeof navigator.mediaDevices.getDisplayMedia !== "function") {
    return "Screen recording is not supported in this browser.";
  }
  return "";
};

export const getFriendlyMediaError = (error: unknown) => {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
        return "Permission blocked. Please allow access from the browser address bar.";
      case "NotFoundError":
        return "No microphone or camera found on this device.";
      case "NotReadableError":
        return "Device is already being used by another app or browser tab.";
      case "SecurityError":
        return "Browser blocked access due to security settings. Use HTTPS.";
      case "AbortError":
        return "Device access was cancelled or interrupted.";
      default:
        return error.message || "Could not start media device.";
    }
  }
  if (error instanceof Error) return error.message || "Could not start media device.";
  return "Could not start media device.";
};

export const stopMediaStream = (stream?: MediaStream | null) => {
  stream?.getTracks().forEach((track) => {
    if (track.readyState !== "ended") track.stop();
  });
};
