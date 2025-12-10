import { useRef } from "react";
import { palmReadedService } from "./services";

export function App() {
  const imageRef = useRef<HTMLImageElement>(null);
  const inputCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = () => {
    if (
      !imageRef.current ||
      !inputCanvasRef.current ||
      !outputCanvasRef.current
    )
      return;

    const img = imageRef.current;
    const inputCanvas = inputCanvasRef.current;
    const outputCanvas = outputCanvasRef.current;

    inputCanvas.width = img.naturalWidth;
    inputCanvas.height = img.naturalHeight;
    outputCanvas.width = img.naturalWidth;
    outputCanvas.height = img.naturalHeight;

    const ctx = inputCanvas.getContext("2d");
    const outputCtx = outputCanvas.getContext("2d");

    if (!ctx || !outputCtx) return;

    ctx.drawImage(img, 0, 0);
    outputCtx.drawImage(img, 0, 0);

    palmReadedService.processImage({
      inputCanvas,
      outputCanvas,
    });
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
          style={{ display: "none" }}
          alt="Upload an image"
        />
        <canvas ref={inputCanvasRef} style={{ display: "none" }} />
        <canvas
          ref={outputCanvasRef}
          style={{ maxWidth: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}
