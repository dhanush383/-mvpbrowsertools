export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return "0 bytes";
  const units = ["bytes", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(value >= 10 ? 1 : 2)} ${units[unit]}`;
};

export const bytesToKb = (bytes: number) => bytes / 1024;

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const getExtension = (file: File) => {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "" : "";
};

export const safeFilename = (name: string, suffix: string, extension: string) => {
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "file";
  return `${base}-${suffix}.${extension}`;
};
