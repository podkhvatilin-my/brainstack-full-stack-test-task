import {
  handLandmarkerService,
  type HandLandmarkerService,
} from "./hand-landmarker.service";
import { opencvService, type OpenCVService } from "./opencv.service";

export const bootServices = async (): Promise<void> => {
  await Promise.all([
    handLandmarkerService.initialize(),
    opencvService.initialize(),
  ])
    .then(() => {
      console.log("All services initialized");
    })
    .catch((error) => {
      console.error("Initialization error:", error);
      throw error;
    });
};

export const disposeServices = (): void => {
  handLandmarkerService.dispose();
};

export interface Services {
  handLandmarkerService: HandLandmarkerService;
  opencvService: OpenCVService;
}

export const services: Services = {
  handLandmarkerService,
  opencvService,
};
