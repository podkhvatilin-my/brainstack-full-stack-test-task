import { type FastifyPluginAsync } from "fastify";
import { generatePalmLines } from "../services/palmistry.service.js";
import { drawPalmLines } from "../services/image.service.js";
import sharp from "sharp";
import type { NormalizedLandmark, PalmistryResponse } from "../types/index.js";

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  fastify.post("/palmistry", async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: "No file uploaded" });
      }

      const imageBuffer = await data.toBuffer();

      // Get other form fields
      const fields = data.fields;
      const landmarksField = fields.landmarks as any;
      const imageWidthField = fields.imageWidth as any;
      const imageHeightField = fields.imageHeight as any;

      const landmarks: NormalizedLandmark[] = JSON.parse(landmarksField.value);
      const imageWidth = parseInt(imageWidthField.value);
      const imageHeight = parseInt(imageHeightField.value);

      // Process image with sharp to ensure consistent dimensions
      const processedImageBuffer = await sharp(imageBuffer)
        .resize(imageWidth, imageHeight, { fit: "fill" })
        .toBuffer();

      // Generate palm lines analysis
      const analysis = generatePalmLines(landmarks, imageWidth, imageHeight);

      // Draw palm lines on the image
      const resultImageBuffer = await drawPalmLines(
        processedImageBuffer,
        analysis,
        imageWidth,
        imageHeight
      );

      // Convert to base64
      const processedImageBase64 = resultImageBuffer.toString("base64");

      const response: PalmistryResponse = {
        analysis,
        processedImage: `data:image/png;base64,${processedImageBase64}`,
      };

      return response;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        error: "Failed to process palmistry analysis",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};
