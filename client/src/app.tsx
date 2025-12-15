import React, { useEffect, useRef, useState } from "react";
import {
  initHandLandmarker,
  detectHand,
} from "./services/hand-landmarker.service";
import { generatePalmLines } from "./services/palmistry.service";
import type { AnalysisResult, PalmLine } from "./types";
import { HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [jsonResult, setJsonResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState("Loading model...");
  const [showDebug, setShowDebug] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initHandLandmarker()
      .then(() => setStatus("Ready! Please select a photo."))
      .catch((err) => setStatus(`Error: ${err}`));
  }, []);

  const processImage = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const result = detectHand(imageRef.current);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Setting dimensions
    const w = imageRef.current.naturalWidth;
    const h = imageRef.current.naturalHeight;
    canvasRef.current.width = w;
    canvasRef.current.height = h;

    // Drawing original image
    ctx.drawImage(imageRef.current, 0, 0);

    if (result && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      // === RUNNING NEW ALGORITHM ===
      const analysis = generatePalmLines(landmarks, w, h);
      setJsonResult(analysis);

      // Drawing lines
      drawLines(ctx, analysis.lines, w, h);

      if (showDebug) {
        const drawer = new DrawingUtils(ctx);
        drawer.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#ffffff55",
          lineWidth: 1,
        });
        drawer.drawLandmarks(landmarks, { color: "#ffffffaa", radius: 2 });
      }
    } else {
      setJsonResult(null);
      alert("Руку не знайдено");
    }
  };

  const drawLines = (
    ctx: CanvasRenderingContext2D,
    lines: PalmLine[],
    w: number,
    h: number
  ) => {
    lines.forEach((line) => {
      ctx.beginPath();

      // Colors as in the diagram (all red, or multicolored for debug)
      // If you want exactly as in the photo - make them red:
      // ctx.strokeStyle = '#dd2c00';

      // But for distinction, we'll leave different colors:
      if (line.name === "Life") ctx.strokeStyle = "rgba(220, 20, 60, 0.85)"; // Crimson
      if (line.name === "Head") ctx.strokeStyle = "rgba(50, 205, 50, 0.85)"; // LimeGreen
      if (line.name === "Heart") ctx.strokeStyle = "rgba(0, 100, 255, 0.85)"; // Blue

      // Line thickness: a bit thinner for elegance
      ctx.lineWidth = w * 0.005;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      line.polyline.forEach((pt, i) => {
        const x = pt[0] * w;
        const y = pt[1] * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImageSrc(url);
    }
  };

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        display: "flex",
        gap: 20,
      }}
    >
      <div>
        <h3>1. Upload</h3>
        <input type="file" onChange={handleFile} accept="image/*" />
        <br />
        <label>
          <input
            type="checkbox"
            checked={showDebug}
            onChange={(e) => setShowDebug(e.target.checked)}
          />
          Show skeleton (MediaPipe Debug)
        </label>
        <p>{status}</p>

        <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              style={{ display: "none" }}
              onLoad={processImage}
            />
          )}
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div style={{ width: "400px" }}>
        <h3>2. JSON Result</h3>
        <textarea
          style={{ width: "100%", height: "80vh", fontFamily: "monospace" }}
          value={jsonResult ? JSON.stringify(jsonResult, null, 2) : ""}
          readOnly
        />
      </div>
    </div>
  );
};
