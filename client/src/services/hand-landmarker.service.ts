import {
  HandLandmarker,
  FilesetResolver,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const HAND_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

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
  FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

const createHandLandmarkerOptions = () => ({
  baseOptions: {
    modelAssetPath: HAND_LANDMARKER_MODEL_URL,
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
export interface HandLandmarkerService {
  initialize: () => Promise<void>;
  detect: (image: HTMLImageElement | ImageData) => HandLandmarkerResult | null;
  isReady: () => boolean;
  dispose: () => void;
}

export const handLandmarkerService: HandLandmarkerService = {
  initialize,
  detect,
  isReady,
  dispose,
};
