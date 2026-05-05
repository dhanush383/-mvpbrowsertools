import { safeFilename } from "./fileUtils";

export interface LoadedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export interface CompressedImageResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  filename: string;
  quality: number;
}

export const loadImageFile = (file: File): Promise<LoadedImage> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ image, width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    image.src = url;
  });

const drawToBlob = async (
  image: HTMLImageElement,
  width: number,
  height: number,
  type: string,
  quality: number,
): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export image."));
      },
      type,
      quality,
    );
  });
};

export const compressImageToTarget = async (
  file: File,
  targetKb: number,
  preferredQuality: number,
): Promise<CompressedImageResult> => {
  const { image, width, height } = await loadImageFile(file);
  const targetBytes = Math.max(1, targetKb) * 1024;
  const type = file.type === "image/webp" ? "image/webp" : "image/jpeg";
  const extension = type === "image/webp" ? "webp" : "jpg";
  let scale = 1;
  let bestBlob = await drawToBlob(image, width, height, type, preferredQuality);
  let bestQuality = preferredQuality;
  let bestWidth = width;
  let bestHeight = height;

  for (let pass = 0; pass < 6; pass += 1) {
    let low = 0.3;
    let high = Math.min(0.98, preferredQuality);
    for (let i = 0; i < 8; i += 1) {
      const quality = (low + high) / 2;
      const blob = await drawToBlob(image, width * scale, height * scale, type, quality);
      if (blob.size <= targetBytes) {
        bestBlob = blob;
        bestQuality = quality;
        bestWidth = Math.round(width * scale);
        bestHeight = Math.round(height * scale);
        low = quality;
      } else {
        high = quality;
      }
    }
    if (bestBlob.size <= targetBytes || scale <= 0.35) break;
    scale *= 0.82;
  }

  if (bestBlob.size > targetBytes) {
    const blob = await drawToBlob(image, width * scale, height * scale, type, 0.3);
    bestBlob = blob.size < bestBlob.size ? blob : bestBlob;
    bestQuality = 0.3;
    bestWidth = Math.round(width * scale);
    bestHeight = Math.round(height * scale);
  }

  return {
    blob: bestBlob,
    url: URL.createObjectURL(bestBlob),
    width: bestWidth,
    height: bestHeight,
    filename: safeFilename(file.name, `compressed-${targetKb}kb`, extension),
    quality: bestQuality,
  };
};

export const resizeImage = async (
  file: File,
  width: number,
  height: number,
  quality = 0.9,
): Promise<CompressedImageResult> => {
  const { image } = await loadImageFile(file);
  const type = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
  const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const blob = await drawToBlob(image, width, height, type, quality);
  return {
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    filename: safeFilename(file.name, `${width}x${height}`, extension),
    quality,
  };
};
