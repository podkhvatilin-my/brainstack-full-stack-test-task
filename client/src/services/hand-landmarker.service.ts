import {
  HandLandmarker,
  FilesetResolver,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

type HandLandmarkerState = {
  landmarker: HandLandmarker | null;
  initialized: boolean;
};

const createInitialState = (): HandLandmarkerState => ({
  landmarker: null,
  initialized: false,
});

let state = createInitialState();

const createVisionFilesetResolver = () =>
  FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

const createHandLandmarkerOptions = () => ({
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    delegate: "GPU" as const,
  },
  runningMode: "IMAGE" as const,
  numHands: 2,
});

const createHandLandmarker = async (): Promise<HandLandmarker> => {
  const vision = await createVisionFilesetResolver();
  const options = createHandLandmarkerOptions();
  return HandLandmarker.createFromOptions(vision, options);
};

export const initialize = async (): Promise<void> => {
  if (state.initialized) return;

  const landmarker = await createHandLandmarker();
  state = { landmarker, initialized: true };
};

export const detect = (
  image: HTMLImageElement | ImageData
): HandLandmarkerResult | null => {
  if (!state.landmarker || !state.initialized) {
    return null;
  }

  return state.landmarker.detect(image);
};

export const isReady = (): boolean => state.initialized;

export const dispose = (): void => {
  if (state.landmarker) {
    state.landmarker.close();
    state = createInitialState();
  }
};

export const handLandmarkerService = {
  initialize,
  detect,
  isReady,
  dispose,
};
