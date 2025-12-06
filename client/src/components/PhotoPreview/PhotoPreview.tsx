import styles from "./PhotoPreview.module.css";

interface PhotoPreviewProps {
  imageSrc: string;
  onRetake: () => void;
  onClose: () => void;
  isUploading?: boolean;
  uploadError?: string | null;
}

export const PhotoPreview = (props: PhotoPreviewProps) => {
  const { imageSrc, onRetake, onClose, isUploading, uploadError } = props;

  return (
    <>
      <img src={imageSrc} alt="Captured" className={styles.preview} />
      {isUploading && <p className={styles.status}>Uploading...</p>}
      {uploadError && <p className={styles.error}>Error: {uploadError}</p>}
      <div className={styles.controls}>
        <button onClick={onRetake} className={styles.button} disabled={isUploading}>
          Retake Photo
        </button>
        <button onClick={onClose} className={styles.button} disabled={isUploading}>
          Close
        </button>
      </div>
    </>
  );
};
