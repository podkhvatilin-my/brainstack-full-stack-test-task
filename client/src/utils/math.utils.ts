import type { Point } from "../types";

export const lerp = (p1: Point, p2: Point, t: number): Point => {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
};

export const getQuadraticBezierPoints = (
  p0: Point,
  p1: Point,
  p2: Point,
  segments: number = 30
): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const invT = 1 - t;
    // Формула: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
    const y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
    points.push({ x, y });
  }
  return points;
};

export const calculateLength = (
  polyline: Point[],
  width: number,
  height: number
): number => {
  let length = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dx = (polyline[i + 1].x - polyline[i].x) * width;
    const dy = (polyline[i + 1].y - polyline[i].y) * height;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return Math.round(length);
};
