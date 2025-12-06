import { useState, useCallback, useTransition } from "react";
import { uploadImage, getImageUrl } from "../api/images";

export const useImageUpload = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const captureAndUpload = useCallback(async (dataUrl: string) => {
    setCapturedImage(dataUrl);
    setUploadError(null);
    startTransition(async () => {
      try {
        const result = await uploadImage(dataUrl);
        const serverUrl = getImageUrl(result.id);
        
        setCapturedImage(serverUrl);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : 'Upload failed');
        console.error('Upload failed:', error);
      }
    });
  }, []);

  const reset = useCallback(() => {
    setCapturedImage(null);
    setUploadError(null);
  }, []);

  return {
    capturedImage,
    isUploading: isPending,
    uploadError,
    captureAndUpload,
    reset,
  };
};
