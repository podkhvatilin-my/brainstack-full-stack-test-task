import type { AnalysisResult, Point } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface PalmistryRequest {
  image: File;
  landmarks: Point[];
  imageWidth: number;
  imageHeight: number;
}

export interface PalmistryResponse {
  analysis: AnalysisResult;
  processedImage: string;
}

/**
 * Creates form data for palmistry analysis request
 */
const createPalmistryFormData = (request: PalmistryRequest): FormData => {
  const formData = new FormData();
  formData.append("image", request.image);
  formData.append(
    "landmarks",
    JSON.stringify(
      request.landmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      }))
    )
  );
  formData.append("imageWidth", request.imageWidth.toString());
  formData.append("imageHeight", request.imageHeight.toString());
  return formData;
};

/**
 * Handles API response and throws error if not ok
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error: ${response.status} - ${errorText}`);
  }
  return response.json();
};

/**
 * Analyzes palm lines from an image with hand landmarks
 */
export const analyzePalmistry = async (
  request: PalmistryRequest
): Promise<PalmistryResponse> => {
  const formData = createPalmistryFormData(request);

  const response = await fetch(`${API_URL}/palmistry`, {
    method: "POST",
    body: formData,
  });

  const data = await handleResponse<{
    analysis: AnalysisResult;
    processedImage: string;
  }>(response);

  return {
    analysis: data.analysis,
    processedImage: data.processedImage,
  };
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse<{ status: string }>(response);
};
