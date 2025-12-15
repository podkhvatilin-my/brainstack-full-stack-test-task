import { createCanvas, loadImage, Canvas } from "canvas";
import type { AnalysisResult, PalmLine } from "../types";

export const drawPalmLines = async (
  imageBuffer: Buffer,
  analysis: AnalysisResult,
  width: number,
  height: number
): Promise<Buffer> => {
  // Load the original image
  const image = await loadImage(imageBuffer);

  // Create canvas with the image dimensions
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Draw the original image
  ctx.drawImage(image, 0, 0, width, height);

  // Draw palm lines
  analysis.lines.forEach((line: PalmLine) => {
    ctx.beginPath();

    // Set colors for different lines
    if (line.name === "Life") ctx.strokeStyle = "rgba(220, 20, 60, 0.85)"; // Crimson
    if (line.name === "Head") ctx.strokeStyle = "rgba(50, 205, 50, 0.85)"; // LimeGreen
    if (line.name === "Heart") ctx.strokeStyle = "rgba(0, 100, 255, 0.85)"; // Blue

    // Set line style
    ctx.lineWidth = width * 0.005;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw the polyline
    line.polyline.forEach((pt, i) => {
      const x = pt[0] * width;
      const y = pt[1] * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  // Return the canvas as a PNG buffer
  return canvas.toBuffer("image/png");
};
