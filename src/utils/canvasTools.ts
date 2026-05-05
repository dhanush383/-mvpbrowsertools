export interface EditBox {
  x: number;
  y: number;
  width: number;
  height: number;
  mode: "blur" | "redact" | "annotate";
}

export const normalizeBox = (startX: number, startY: number, endX: number, endY: number): EditBox => ({
  x: Math.min(startX, endX),
  y: Math.min(startY, endY),
  width: Math.abs(endX - startX),
  height: Math.abs(endY - startY),
  mode: "blur",
});

export const renderScreenshotEdits = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  boxes: EditBox[],
  preview?: EditBox | null,
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  [...boxes, ...(preview ? [preview] : [])].forEach((box) => {
    if (box.width < 2 || box.height < 2) return;
    if (box.mode === "redact") {
      ctx.fillStyle = "#111827";
      ctx.fillRect(box.x, box.y, box.width, box.height);
      return;
    }
    if (box.mode === "annotate") {
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = Math.max(3, Math.round(canvas.width / 240));
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      return;
    }

    const temp = document.createElement("canvas");
    temp.width = Math.max(1, Math.round(box.width));
    temp.height = Math.max(1, Math.round(box.height));
    const tctx = temp.getContext("2d");
    if (!tctx) return;
    tctx.drawImage(canvas, box.x, box.y, box.width, box.height, 0, 0, temp.width, temp.height);
    ctx.save();
    ctx.filter = "blur(10px)";
    ctx.drawImage(temp, box.x, box.y, box.width, box.height);
    ctx.restore();
    ctx.fillStyle = "rgba(15, 23, 42, 0.08)";
    ctx.fillRect(box.x, box.y, box.width, box.height);
  });
};

export const cropCanvasToBox = (source: HTMLCanvasElement, box: EditBox) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(box.width));
  canvas.height = Math.max(1, Math.round(box.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");
  ctx.drawImage(source, box.x, box.y, box.width, box.height, 0, 0, canvas.width, canvas.height);
  return canvas;
};

export const canvasToBlob = (canvas: HTMLCanvasElement, type = "image/png", quality = 0.92): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export image."));
      },
      type,
      quality,
    );
  });
