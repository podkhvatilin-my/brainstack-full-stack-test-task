import { useState, useRef, useCallback } from "react";

export const usePhotoCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capturePhoto = useCallback(
    (videoElement: HTMLVideoElement | null): string | null => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!videoElement || !canvas || !context) return null;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
      return dataUrl;
    },
    []
  );

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const setImage = useCallback((imageUrl: string) => {
    setCapturedImage(imageUrl);
  }, []);

  return {
    canvasRef,
    capturedImage,
    capturePhoto,
    retakePhoto,
    setImage,
  };
};
