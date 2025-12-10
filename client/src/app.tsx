import { useRef } from "react";
import { useServices } from "./contexts";

export function App() {
  const { isInitialized, services } = useServices();

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageLoad = () => {
    if (!isInitialized || !imageRef.current || !canvasRef.current) return;

    const { opencvService } = services;

    const cv = opencvService.getCV();

    const src = cv.imread(imageRef.current);
    const gray = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    cv.imshow(canvasRef.current, gray);

    src.delete();
    gray.delete();
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
      {!isInitialized && <p>Loading services...</p>}
    </div>
  );
}
