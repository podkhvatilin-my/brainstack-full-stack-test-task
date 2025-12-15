import { type FastifyPluginAsync } from "fastify";
import { generatePalmLines } from "../services/palmistry.service.js";
import { drawPalmLines } from "../services/image.service.js";
import sharp from "sharp";
import type { NormalizedLandmark, PalmistryResponse } from "../types/index.js";

const palmistryRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/palmistry", {
    schema: {
      description: "Analyze palm from uploaded image with landmarks",
      tags: ["palmistry"],
      consumes: ["multipart/form-data"],
      response: {
        200: {
          type: "object",
          properties: {
            analysis: {
              type: "object",
              properties: {
                lines: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      polyline: {
                        type: "array",
                        items: {
                          type: "array",
                          items: { type: "number" },
                        },
                      },
                      metrics: {
                        type: "object",
                        properties: {
                          length_px: { type: "number" },
                          curvature: { type: "number" },
                          breaks: { type: "number" },
                          depth_estimate: { type: "string" },
                          forks: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
            processedImage: { type: "string" },
          },
        },
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        500: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ error: "No file uploaded" });
      }

      const imageBuffer = await data.toBuffer();

      const fields = data.fields;
      const landmarksField = fields.landmarks as any;
      const imageWidthField = fields.imageWidth as any;
      const imageHeightField = fields.imageHeight as any;

      const landmarks: NormalizedLandmark[] = JSON.parse(landmarksField.value);
      const imageWidth = parseInt(imageWidthField.value, 10);
      const imageHeight = parseInt(imageHeightField.value, 10);

      const processedImageBuffer = await sharp(imageBuffer)
        .resize(imageWidth, imageHeight, { fit: "fill" })
        .toBuffer();

      const analysis = generatePalmLines(landmarks, imageWidth, imageHeight);

      const resultImageBuffer = await drawPalmLines(
        processedImageBuffer,
        analysis,
        imageWidth,
        imageHeight
      );

      const processedImageBase64 = resultImageBuffer.toString("base64");

      const response: PalmistryResponse = {
        analysis,
        processedImage: `data:image/png;base64,${processedImageBase64}`,
      };

      return response;
    },
  });
};

export default palmistryRoute;
