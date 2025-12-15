import {
  HandLandmarker,
  FilesetResolver,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;
let isInitializing = false;

export const initHandLandmarker = async (): Promise<void> => {
  if (handLandmarker || isInitializing) return;

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    console.log("HandLandmarker initialized successfully");
  } catch (error) {
    console.error("Error initializing HandLandmarker:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

export const detectHand = (
  image: HTMLImageElement | HTMLCanvasElement
): HandLandmarkerResult | null => {
  if (!handLandmarker) {
    console.warn(
      "HandLandmarker not initialized. Call initHandLandmarker() first."
    );
    return null;
  }

  try {
    return handLandmarker.detect(image);
  } catch (error) {
    console.error("Error detecting hands:", error);
    return null;
  }
};
