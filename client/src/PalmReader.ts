import { Hands, NormalizedLandmark } from "@mediapipe/hands";

// Декларація глобального об'єкта OpenCV
declare const cv: any;

export class PalmReader {
  private hands: Hands;
  private outputCanvas: HTMLCanvasElement;

  constructor(canvasEl: HTMLCanvasElement) {
    this.outputCanvas = canvasEl;
    this.ctx = this.outputCanvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    // Ініціалізація MediaPipe Hands
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      // ВАЖЛИВО: для фотографій цей режим працює краще і точніше
      staticImageMode: true,
    });
  }

  /**
   * Головний метод, який викликається з App.tsx
   * Обгортає MediaPipe callback у Promise для використання з await
   */
  public async processStaticImage(
    inputCanvas: HTMLCanvasElement
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // Налаштовуємо обробник результатів для цього конкретного виклику
      this.hands.onResults((results) => {
        try {
          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
          ) {
            this.processHandCV(results.multiHandLandmarks[0]);
          } else {
            console.warn("No hands detected");
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      // Відправляємо зображення на обробку в MediaPipe
      try {
        await this.hands.send({ image: inputCanvas });
      } catch (error) {
        reject(error);
      }
    });
  }

  private processHandCV(landmarks: NormalizedLandmark[]) {
    if (!window.cv) return;

    const width = this.outputCanvas.width;
    const height = this.outputCanvas.height;

    // Читаємо поточний стан канвасу (там вже намальовано фото)
    let srcMat = cv.imread(this.outputCanvas);

    // --- ШАГ 1: Створення маски многокутника долоні ---
    const palmPoints = [
      landmarks[0], // Зап'ястя
      landmarks[1], // Основа великого пальця
      landmarks[5], // Основа вказівного пальця
      landmarks[9], // Основа середнього пальця
      landmarks[13], // Основа безіменного пальця
      landmarks[17], // Основа мізинця
    ];

    // Створюємо маску для многокутника
    let mask = new cv.Mat.zeros(height, width, cv.CV_8UC1);

    // Конвертуємо точки в формат OpenCV
    let pts = palmPoints.map((p) => ({
      x: Math.floor(p.x * width),
      y: Math.floor(p.y * height),
    }));

    let contourPoints = cv.matFromArray(
      pts.length,
      1,
      cv.CV_32SC2,
      pts.flatMap((p) => [p.x, p.y])
    );

    let contourVec = new cv.MatVector();
    contourVec.push_back(contourPoints);

    // Заповнюємо многокутник білим кольором
    cv.fillPoly(mask, contourVec, new cv.Scalar(255), cv.LINE_8);

    // --- ШАГ 2: Визначення bounding box для оптимізації ---
    const padding = 30;
    const minX = Math.max(0, Math.min(...pts.map((p) => p.x)) - padding);
    const maxX = Math.min(width, Math.max(...pts.map((p) => p.x)) + padding);
    const minY = Math.max(0, Math.min(...pts.map((p) => p.y)) - padding);
    const maxY = Math.min(height, Math.max(...pts.map((p) => p.y)) + padding);

    const roiWidth = Math.floor(maxX - minX);
    const roiHeight = Math.floor(maxY - minY);

    // Вирізаємо ROI з оригіналу та маски
    let roi = srcMat.roi(
      new cv.Rect(Math.floor(minX), Math.floor(minY), roiWidth, roiHeight)
    );
    let roiMask = mask.roi(
      new cv.Rect(Math.floor(minX), Math.floor(minY), roiWidth, roiHeight)
    );

    // --- ШАГ 3: Виділення ліній (CLAHE + BlackHat) ---
    let gray = new cv.Mat();
    cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);

    // CLAHE
    let clahe = new cv.CLAHE(3.0, new cv.Size(8, 8));
    clahe.apply(gray, gray);

    // Gaussian Blur
    cv.GaussianBlur(gray, gray, new cv.Size(3, 3), 0);

    // Black Hat (шукаємо темні лінії)
    let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
    let morph = new cv.Mat();
    cv.morphologyEx(gray, morph, cv.MORPH_BLACKHAT, kernel);

    // Threshold
    let binary = new cv.Mat();
    cv.threshold(morph, binary, 15, 255, cv.THRESH_BINARY);

    // Створюємо повнорозмірну матрицю для binary
    const fullBinary = new cv.Mat.zeros(height, width, cv.CV_8UC1);
    const binaryRoi = fullBinary.roi(
      new cv.Rect(Math.floor(minX), Math.floor(minY), roiWidth, roiHeight)
    );
    binary.copyTo(binaryRoi);

    // Конвертуємо в RGBA та змержуємо з оригіналом
    const binaryRGB = new cv.Mat();
    cv.cvtColor(fullBinary, binaryRGB, cv.COLOR_GRAY2RGBA);
    cv.addWeighted(srcMat, 0.7, binaryRGB, 0.3, 0, srcMat);

    cv.imshow(this.outputCanvas, srcMat);

    // --- Очистка пам'яті (Memory Management) ---
    fullBinary.delete();
    binaryRoi.delete();
    binaryRGB.delete();
    srcMat.delete();
    mask.delete();
    contourPoints.delete();
    contourVec.delete();
    roi.delete();
    roiMask.delete();
    gray.delete();
    clahe.delete();
    kernel.delete();
    morph.delete();
    binary.delete();
  }
}
