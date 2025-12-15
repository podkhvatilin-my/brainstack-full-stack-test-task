import {
  lerp,
  getQuadraticBezierPoints,
  calculateLength,
} from "../utils/math.utils.js";
import type {
  Point,
  AnalysisResult,
  LineMetrics,
  PalmLine,
  NormalizedLandmark,
} from "../types";

const offset = (p: Point, dx: number, dy: number): Point => ({
  x: p.x + dx,
  y: p.y + dy,
});

const addRandomness = (p: Point, maxOffset: number = 0.02): Point => ({
  x: p.x + (Math.random() - 0.5) * maxOffset,
  y: p.y + (Math.random() - 0.5) * maxOffset,
});

const calculateCurvature = (polyline: Point[]): number => {
  if (polyline.length < 3) return 0;

  let totalCurvature = 0;
  let count = 0;

  for (let i = 1; i < polyline.length - 1; i++) {
    const p1 = polyline[i - 1];
    const p2 = polyline[i];
    const p3 = polyline[i + 1];

    const v1x = p2.x - p1.x;
    const v1y = p2.y - p1.y;
    const v2x = p3.x - p2.x;
    const v2y = p3.y - p2.y;

    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

    if (len1 > 0 && len2 > 0) {
      const dot = v1x * v2x + v1y * v2y;
      const cos = dot / (len1 * len2);
      const angle = Math.acos(Math.max(-1, Math.min(1, cos)));

      totalCurvature += angle;
      count++;
    }
  }

  return count > 0 ? Math.round((totalCurvature / count) * 100) / 100 : 0;
};

const generateRandomMetadata = (): Pick<
  LineMetrics,
  "breaks" | "depth_estimate" | "forks"
> => {
  const depths = ["shallow", "medium", "deep"] as const;

  return {
    breaks: Math.floor(Math.random() * 4),
    depth_estimate: depths[Math.floor(Math.random() * depths.length)],
    forks: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : undefined,
  };
};

const createLineMetrics = (
  polyline: Point[],
  width: number,
  height: number
): LineMetrics => ({
  length_px: calculateLength(polyline, width, height),
  curvature: calculateCurvature(polyline),
  ...generateRandomMetadata(),
});

const pointsToCoordinates = (points: Point[]): number[][] =>
  points.map((p) => [p.x, p.y]);

const createPalmLine = (
  name: string,
  polyline: Point[],
  width: number,
  height: number
): PalmLine => ({
  name,
  polyline: pointsToCoordinates(polyline),
  metrics: createLineMetrics(polyline, width, height),
});

interface LineGenerationParams {
  landmarks: NormalizedLandmark[];
  getLandmark: (idx: number) => Point;
}

const generateLifeLine = ({
  getLandmark: LM,
}: LineGenerationParams): Point[] => {
  const lifeLineStart = lerp(LM(5), LM(1), 0.2);
  const lifeControl = addRandomness(
    offset(LM(9), LM(9).x * -0.1, LM(2).y * 0.3),
    0.015
  );
  const lifeLineEnd = offset(lerp(LM(0), LM(1), 0.25), 0, 0);

  return getQuadraticBezierPoints(lifeLineStart, lifeControl, lifeLineEnd, 40);
};

const generateHeadLine = ({
  getLandmark: LM,
}: LineGenerationParams): Point[] => {
  const lifeLineStart = lerp(LM(5), LM(1), 0.2);
  const headLineStart = offset(lifeLineStart, 0, lifeLineStart.y * -0.05);
  const headControl = addRandomness(offset(LM(9), 0, LM(9).y * 0.15), 0.012);
  const headLineEnd = lerp(LM(17), LM(0), 0.35);

  return getQuadraticBezierPoints(headLineStart, headControl, headLineEnd, 40);
};

const generateHeartLine = ({
  getLandmark: LM,
}: LineGenerationParams): Point[] => {
  const heartLineStart = lerp(LM(5), LM(9), 0.3);
  const heartControl = addRandomness(
    offset(LM(9), LM(9).x * -0.01, LM(9).y * 0.2),
    0.018
  );
  const heartLineEnd = lerp(LM(17), LM(0), 0.05);

  return getQuadraticBezierPoints(
    heartLineStart,
    heartControl,
    heartLineEnd,
    40
  );
};

export const generatePalmLines = (
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): AnalysisResult => {
  const getLandmark = (idx: number): Point => ({
    x: landmarks[idx].x,
    y: landmarks[idx].y,
  });

  const params: LineGenerationParams = { landmarks, getLandmark };

  const lifePolyline = generateLifeLine(params);
  const headPolyline = generateHeadLine(params);
  const heartPolyline = generateHeartLine(params);

  return {
    lines: [
      createPalmLine("Life", lifePolyline, width, height),
      createPalmLine("Head", headPolyline, width, height),
      createPalmLine("Heart", heartPolyline, width, height),
    ],
  };
};
