import { useEffect, useRef, useState } from "react";
import { type HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { handLandmarkerService } from "./services/hand-landmarker.service";

const drawLandmark = (
  ctx: CanvasRenderingContext2D,
  landmark: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
) => {
  ctx.beginPath();
  ctx.arc(
    landmark.x * canvasWidth,
    landmark.y * canvasHeight,
    5,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = "red";
  ctx.fill();
};

const drawLandmarks = (
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number }>,
  canvasWidth: number,
  canvasHeight: number
) => {
  landmarks.forEach((landmark) =>
    drawLandmark(ctx, landmark, canvasWidth, canvasHeight)
  );
};

const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.clearRect(0, 0, width, height);
};

const renderResults = (
  canvas: HTMLCanvasElement,
  results: HandLandmarkerResult | null
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx || !results?.landmarks) return;

  clearCanvas(ctx, canvas.width, canvas.height);
  results.landmarks.forEach((landmarks) =>
    drawLandmarks(ctx, landmarks, canvas.width, canvas.height)
  );
};

export function App() {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    handLandmarkerService.initialize().then(() => setIsReady(true));
    return () => handLandmarkerService.dispose();
  }, []);

  const handleImageLoad = () => {
    if (!isReady || !imageRef.current || !canvasRef.current) return;

    const results = handLandmarkerService.detect(imageRef.current);
    renderResults(canvasRef.current, results);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (imageRef.current && event.target?.result) {
        imageRef.current.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <div style={{ position: "relative", marginTop: "20px" }}>
        <img
          ref={imageRef}
          onLoad={handleImageLoad}
          style={{ maxWidth: "640px", display: "block" }}
          alt="Upload an image"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
      {!isReady && <p>Loading hand landmarker...</p>}
    </div>
  );
}
