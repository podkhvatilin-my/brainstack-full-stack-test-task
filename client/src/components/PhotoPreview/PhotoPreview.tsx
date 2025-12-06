import styles from "./PhotoPreview.module.css";

interface PhotoPreviewProps {
  imageSrc: string;
  onRetake: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  error?: string | null;
  job?: {
    status: string;
    progress: number;
    message: string;
    result?: {
      containsHand: boolean;
      explanation: string;
    };
  } | null;
}

export const PhotoPreview = (props: PhotoPreviewProps) => {
  const { imageSrc, onRetake, onClose, isProcessing, error, job } = props;

  return (
    <>
      <img src={imageSrc} alt="Captured" className={styles.preview} />
      
      {error && <p className={styles.error}>Error: {error}</p>}
      
      {job && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className={styles.status}>{job.message} ({job.progress}%)</p>
        </div>
      )}
      
      {job?.status === "completed" && job.result && (
        <div className={styles.result}>
          <p className={job.result.containsHand ? styles.success : styles.warning}>
            {job.result.containsHand ? '✓ Hand detected!' : '✗ No hand detected'}
          </p>
          <p className={styles.explanation}>{job.result.explanation}</p>
        </div>
      )}
      
      <div className={styles.controls}>
        <button onClick={onRetake} className={styles.button} disabled={isProcessing}>
          Retake Photo
        </button>
        <button onClick={onClose} className={styles.button} disabled={isProcessing}>
          Close
        </button>
      </div>
    </>
  );
};
