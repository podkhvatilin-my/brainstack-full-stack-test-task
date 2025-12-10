declare global {
  interface Window {
    cv: any;
    onOpenCvReady?: () => void;
  }
}

type OpenCVState = {
  cv: any | null;
  initialized: boolean;
  loading: boolean;
};

const createInitialState = (): OpenCVState => ({
  cv: null,
  initialized: false,
  loading: false,
});

let state = createInitialState();
let initializationPromise: Promise<void> | null = null;

const waitForOpenCV = (
  resolve: () => void,
  reject: (error: Error) => void,
  timeout = 30000
): void => {
  const checkReady = setInterval(() => {
    if (window.cv && window.cv.Mat) {
      console.log("OpenCV ready");
      clearInterval(checkReady);
      resolve();
    }
  }, 100);

  setTimeout(() => {
    clearInterval(checkReady);
    reject(new Error("OpenCV initialization timeout"));
  }, timeout);
};

const loadOpenCVScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.cv && window.cv.Mat) {
      console.log("OpenCV already loaded");
      resolve();

      return;
    }

    const existingScript = document.querySelector('script[src="/opencv.js"]');

    if (existingScript) {
      console.log("OpenCV script already exists, waiting for it to load");
      waitForOpenCV(resolve, reject);

      return;
    }

    console.log("Loading OpenCV script...");

    const script = Object.assign(document.createElement("script"), {
      src: "/opencv.js",
      async: true,
      type: "text/javascript",
      onload: () => {
        console.log("OpenCV script loaded, waiting for cv to initialize");
        waitForOpenCV(resolve, reject);
      },
      onerror: (error: string | Event) => {
        console.error("Failed to load OpenCV.js", error);
        reject(new Error("Failed to load OpenCV.js"));
      },
    });

    document.body.appendChild(script);
  });
};

export const initialize = async (): Promise<void> => {
  if (state.initialized) return;
  if (initializationPromise) return initializationPromise;

  state.loading = true;

  initializationPromise = loadOpenCVScript()
    .then(() => {
      state = {
        cv: window.cv,
        initialized: true,
        loading: false,
      };
    })
    .catch((error) => {
      state.loading = false;
      initializationPromise = null;
      throw error;
    });

  return initializationPromise;
};

export const getCV = (): any => {
  if (!state.initialized || !state.cv) {
    throw new Error("OpenCV is not initialized. Call initialize() first.");
  }

  return state.cv;
};

export const isInitialized = (): boolean => {
  return state.initialized;
};

export const isLoading = (): boolean => {
  return state.loading;
};

export interface OpenCVService {
  initialize: () => Promise<void>;
  getCV: () => any;
  isInitialized: () => boolean;
  isLoading: () => boolean;
}

export const opencvService: OpenCVService = {
  initialize,
  getCV,
  isInitialized,
  isLoading,
};
