import { useCamera } from "./hooks/useCamera";
import { usePhotoCapture } from "./hooks/usePhotoCapture";
import { CameraView } from "./components/CameraView/CameraView";
import { PhotoPreview } from "./components/PhotoPreview/PhotoPreview";
import { StartButton } from "./components/StartButton/StartButton";
import styles from "./App.module.css";

export function App() {
  const { videoRef, stream, isCameraActive, startCamera, stopCamera } = useCamera();
  const { canvasRef, capturedImage, capturePhoto, retakePhoto } =
    usePhotoCapture();

  const handleCapture = () => {
    capturePhoto(videoRef.current);
  };

  const handleRetake = () => {
    retakePhoto();
  };

  const handleClose = () => {
    retakePhoto();
    stopCamera();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Photo Capture App</h1>

      <div className={styles.cameraContainer}>
        {!isCameraActive && !capturedImage && (
          <StartButton onStart={startCamera} />
        )}

        {isCameraActive && !capturedImage && (
          <CameraView
            videoRef={videoRef}
            stream={stream}
            onCapture={handleCapture}
            onStop={stopCamera}
          />
        )}

        {capturedImage && (
          <PhotoPreview
            imageSrc={capturedImage}
            onRetake={handleRetake}
            onClose={handleClose}
          />
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
