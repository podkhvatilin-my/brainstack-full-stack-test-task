import styles from "./PhotoPreview.module.css";

interface PhotoPreviewProps {
  imageSrc: string;
  onRetake: () => void;
  onClose: () => void;
}

export const PhotoPreview = (props: PhotoPreviewProps) => {
  const { imageSrc, onRetake, onClose } = props;

  return (
    <>
      <img src={imageSrc} alt="Captured" className={styles.preview} />
      <div className={styles.controls}>
        <button onClick={onRetake} className={styles.button}>
          Retake Photo
        </button>
        <button onClick={onClose} className={styles.button}>
          Close
        </button>
      </div>
    </>
  );
};
