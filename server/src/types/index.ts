export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface LineMetrics {
  length_px: number;
  curvature: number;
  breaks: number;
  depth_estimate?: string;
  forks?: number;
}

export interface PalmLine {
  name: string;
  polyline: number[][];
  metrics: LineMetrics;
}

export interface AnalysisResult {
  lines: PalmLine[];
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface PalmistryRequest {
  landmarks: NormalizedLandmark[];
  imageWidth: number;
  imageHeight: number;
}

export interface PalmistryResponse {
  analysis: AnalysisResult;
  processedImage: string; // base64 encoded image
}
