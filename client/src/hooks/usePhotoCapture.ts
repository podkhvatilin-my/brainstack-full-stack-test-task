import { useState, useRef, useCallback, useMemo } from "react";

export const usePhotoCapture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capturePhoto = useCallback((videoElement: HTMLVideoElement | null) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!videoElement || !canvas || !context) return;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    setCapturedImage(canvas.toDataURL("image/png"));
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return useMemo(
    () => ({
      canvasRef,
      capturedImage,
      capturePhoto,
      retakePhoto,
    }),
    [capturedImage, capturePhoto, retakePhoto]
  );
};
