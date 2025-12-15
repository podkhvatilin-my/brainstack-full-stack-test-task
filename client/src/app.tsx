import React, { useEffect, useRef, useState } from "react";
import {
  initHandLandmarker,
  detectHand,
} from "./services/hand-landmarker.service";
import type { AnalysisResult } from "./types";
import { HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

const API_URL = "http://localhost:3000/api";

export const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(
    null
  );
  const [jsonResult, setJsonResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState("Loading model...");
  const [showDebug, setShowDebug] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initHandLandmarker()
      .then(() => setStatus("Ready! Please select a photo."))
      .catch((err) => setStatus(`Error: ${err}`));
  }, []);

  const processImage = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setStatus("Detecting hand landmarks...");

    const result = detectHand(imageRef.current);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Setting dimensions
    const w = imageRef.current.naturalWidth;
    const h = imageRef.current.naturalHeight;
    canvasRef.current.width = w;
    canvasRef.current.height = h;

    if (result && result.landmarks.length > 0) {
      const landmarks = result.landmarks[0];

      // Draw original image with optional debug overlay
      ctx.drawImage(imageRef.current, 0, 0);

      if (showDebug) {
        const drawer = new DrawingUtils(ctx);
        drawer.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#ffffff55",
          lineWidth: 1,
        });
        drawer.drawLandmarks(landmarks, { color: "#ffffffaa", radius: 2 });
      }

      // Send to server for processing
      setStatus("Processing palmistry analysis on server...");

      try {
        if (!imageFile) {
          throw new Error("No image file available");
        }

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("landmarks", JSON.stringify(landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }))));
        formData.append("imageWidth", w.toString());
        formData.append("imageHeight", h.toString());

        const response = await fetch(`${API_URL}/palmistry`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        setJsonResult(data.analysis);
        setProcessedImageSrc(data.processedImage);
        setStatus("Analysis complete!");
      } catch (error) {
        console.error("Error processing palmistry:", error);
        setStatus(
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        alert("Failed to process palmistry analysis");
      }
    } else {
      ctx.drawImage(imageRef.current, 0, 0);
      setJsonResult(null);
      setProcessedImageSrc(null);
      setStatus("No hand detected");
      alert("Руку не знайдено");
    }

    setIsProcessing(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
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
        <p>
          {status} {isProcessing && "⏳"}
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
            <h4 style={{ margin: "5px" }}>Detection Preview</h4>
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

          {processedImageSrc && (
            <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
              <h4 style={{ margin: "5px" }}>Processed Result</h4>
              <img
                src={processedImageSrc}
                alt="Processed palm analysis"
                style={{ display: "block" }}
              />
            </div>
          )}
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
