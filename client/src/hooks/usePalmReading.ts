import { useState, useCallback } from "react";
import { startPalmReading, subscribeToPalmReadingProgress, getImageUrl } from "../api/palm-reading";

export interface PalmReadingJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  result?: {
    containsHand: boolean;
    explanation: string;
    imageId: string | null;
  };
  error?: string;
}

export const usePalmReading = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [job, setJob] = useState<PalmReadingJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startReading = useCallback(async (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setJob(null);
    setError(null);

    try {
      const { jobId } = await startPalmReading(dataUrl);

      // Subscribe to progress updates via SSE
      const unsubscribe = subscribeToPalmReadingProgress(
        jobId,
        (updatedJob) => {
          setJob(updatedJob);

          // Update image URL when hand is detected and stored
          if (
            updatedJob.status === "completed" &&
            updatedJob.result?.imageId
          ) {
            // TODO: uncomment in the future
            // const serverUrl = getImageUrl(updatedJob.result.imageId);
            // setCapturedImage(serverUrl);
          }
        },
        (err) => {
          setError(err.message);
        }
      );

      // Cleanup on unmount
      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start palm reading");
    }
  }, []);

  const reset = useCallback(() => {
    setCapturedImage(null);
    setJob(null);
    setError(null);
  }, []);

  return {
    capturedImage,
    job,
    error,
    isProcessing: job?.status === "pending" || job?.status === "processing",
    startReading,
    reset,
  };
};
