import { useState, useRef, useCallback, useMemo } from "react";

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Failed to access camera. Please check permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    setIsCameraActive(false);
  }, [stream]);

  return useMemo(
    () => ({
      videoRef,
      stream,
      isCameraActive,
      startCamera,
      stopCamera,
    }),
    [stream, isCameraActive, startCamera, stopCamera]
  );
};
