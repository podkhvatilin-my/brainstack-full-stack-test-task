import { handLandmarkerService } from "./hand-landmarker.service";
import { opencvService } from "./opencv.service";
import { palmReadedService } from "./palm-readed.service";

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

export { handLandmarkerService, opencvService, palmReadedService };
