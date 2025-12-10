import { type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { opencvService } from "./opencv.service";
import { handLandmarkerService } from "./hand-landmarker.service";

interface ProcessImageOptions {
  inputCanvas: HTMLCanvasElement;
  outputCanvas: HTMLCanvasElement;
}

interface ProcessOptions {
  outputCanvas: HTMLCanvasElement;
  landmarks: NormalizedLandmark[];
}

const getPalmPoints = (
  landmarks: NormalizedLandmark[]
): NormalizedLandmark[] => [
  landmarks[0], // Wrist
  landmarks[1], // Thumb base
  landmarks[5], // Index finger base
  landmarks[9], // Middle finger base
  landmarks[13], // Ring finger base
  landmarks[17], // Pinky base
];

const convertLandmarksToPoints = (
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): Array<{ x: number; y: number }> =>
  landmarks.map((p) => ({
    x: Math.floor(p.x * width),
    y: Math.floor(p.y * height),
  }));

const createPalmMask = (
  cv: any,
  points: Array<{ x: number; y: number }>,
  width: number,
  height: number
): any => {
  const mask = new cv.Mat.zeros(height, width, cv.CV_8UC1);

  const contourPoints = cv.matFromArray(
    points.length,
    1,
    cv.CV_32SC2,
    points.flatMap((p) => [p.x, p.y])
  );

  const contourVec = new cv.MatVector();
  contourVec.push_back(contourPoints);

  cv.fillPoly(mask, contourVec, new cv.Scalar(255), cv.LINE_8);

  contourPoints.delete();
  contourVec.delete();

  return mask;
};

const calculateBoundingBox = (
  points: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  padding = 30
): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  roiWidth: number;
  roiHeight: number;
} => {
  const minX = Math.max(0, Math.min(...points.map((p) => p.x)) - padding);
  const maxX = Math.min(width, Math.max(...points.map((p) => p.x)) + padding);
  const minY = Math.max(0, Math.min(...points.map((p) => p.y)) - padding);
  const maxY = Math.min(height, Math.max(...points.map((p) => p.y)) + padding);

  return {
    minX,
    maxX,
    minY,
    maxY,
    roiWidth: Math.floor(maxX - minX),
    roiHeight: Math.floor(maxY - minY),
  };
};

const processROI = (cv: any, roi: any): any => {
  const gray = new cv.Mat();
  cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);

  // CLAHE
  const clahe = new cv.CLAHE(3.0, new cv.Size(8, 8));
  clahe.apply(gray, gray);

  // Gaussian Blur
  cv.GaussianBlur(gray, gray, new cv.Size(3, 3), 0);

  // Black Hat
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
  const morph = new cv.Mat();
  cv.morphologyEx(gray, morph, cv.MORPH_BLACKHAT, kernel);

  // Threshold
  const binary = new cv.Mat();
  cv.threshold(morph, binary, 15, 255, cv.THRESH_BINARY);

  // Cleanup temporary matrices
  gray.delete();
  clahe.delete();
  kernel.delete();
  morph.delete();

  return binary;
};

const processHandWithCV = ({
  outputCanvas,
  landmarks,
}: ProcessOptions): void => {
  const cv = opencvService.getCV();
  const width = outputCanvas.width;
  const height = outputCanvas.height;

  // Read current canvas state (photo is already drawn there)
  const srcMat = cv.imread(outputCanvas);

  // --- STEP 1: Creating palm polygon mask ---
  const palmPoints = getPalmPoints(landmarks);
  const points = convertLandmarksToPoints(palmPoints, width, height);
  const mask = createPalmMask(cv, points, width, height);

  // --- STEP 2: Defining bounding box for optimization ---
  const bbox = calculateBoundingBox(points, width, height);

  // Extract ROI from original and mask
  const roi = srcMat.roi(
    new cv.Rect(
      Math.floor(bbox.minX),
      Math.floor(bbox.minY),
      bbox.roiWidth,
      bbox.roiHeight
    )
  );
  const roiMask = mask.roi(
    new cv.Rect(
      Math.floor(bbox.minX),
      Math.floor(bbox.minY),
      bbox.roiWidth,
      bbox.roiHeight
    )
  );

  // --- STEP 3: Line extraction (CLAHE + BlackHat) ---
  const binary = processROI(cv, roi);

  // Create full-size matrix for binary
  const fullBinary = new cv.Mat.zeros(height, width, cv.CV_8UC1);
  const binaryRoi = fullBinary.roi(
    new cv.Rect(
      Math.floor(bbox.minX),
      Math.floor(bbox.minY),
      bbox.roiWidth,
      bbox.roiHeight
    )
  );
  binary.copyTo(binaryRoi);

  // Convert to RGBA and merge with original
  const binaryRGB = new cv.Mat();
  cv.cvtColor(fullBinary, binaryRGB, cv.COLOR_GRAY2RGBA);
  cv.addWeighted(srcMat, 0.7, binaryRGB, 0.3, 0, srcMat);

  cv.imshow(outputCanvas, srcMat);

  // --- STEP 4: Memory cleanup ---
  fullBinary.delete();
  binaryRoi.delete();
  binaryRGB.delete();
  srcMat.delete();
  mask.delete();
  roi.delete();
  roiMask.delete();
  binary.delete();
};

export const processImage = ({
  inputCanvas,
  outputCanvas,
}: ProcessImageOptions): void => {
  const ctx = inputCanvas.getContext("2d");
  if (!ctx) {
    console.warn("Cannot get canvas context");
    return;
  }

  const imageData = ctx.getImageData(
    0,
    0,
    inputCanvas.width,
    inputCanvas.height
  );
  const result = handLandmarkerService.detect(imageData);

  if (!result || !result.landmarks || result.landmarks.length === 0) {
    console.warn("No hands detected");
    return;
  }

  const landmarks = result.landmarks[0];

  processHandWithCV({
    outputCanvas,
    landmarks,
  });
};

export interface PalmReadedService {
  processImage: (options: ProcessImageOptions) => void;
}

export const palmReadedService: PalmReadedService = {
  processImage,
};
