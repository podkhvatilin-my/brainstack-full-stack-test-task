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

export interface LineConfig {
  name: string;
  anchors: {
    startIdx: number;
    endIdx: number;
    weight: number;
  }[];
  baseMetrics: Partial<LineMetrics>;
}
