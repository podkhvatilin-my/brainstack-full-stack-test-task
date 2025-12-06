import { type RefObject, useEffect } from "react";
import styles from "./CameraView.module.css";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  onCapture: () => void;
  onStop: () => void;
}

export const CameraView = (props: CameraViewProps) => {
  const { videoRef, stream, onCapture, onStop } = props;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;
  }, [stream]);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline className={styles.video} />
      <div className={styles.controls}>
        <button onClick={onCapture} className={styles.captureButton}>
          📷 Capture Photo
        </button>
        <button onClick={onStop} className={styles.stopButton}>
          Stop Camera
        </button>
      </div>
    </>
  );
};
