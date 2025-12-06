import { randomUUID } from "crypto";
import { type FastifyInstance } from "fastify";
import { openai } from "../lib/openai";
import { PROMPTS } from "../lib/constants";
import { updateJob } from "./job-queue.service";

export interface HandDetectionResult {
  containsHand: boolean;
  explanation: string;
  imageId: string | null;
}

export const detectHand = async (
  fastify: FastifyInstance,
  buffer: Buffer,
  mimeType: string
): Promise<HandDetectionResult> => {
  const imageId = randomUUID();

  try {
    fastify.imageStorage.save(imageId, buffer, mimeType);

    const base64Image = buffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: PROMPTS.PALM_DETECTION,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    });

    const answer = response.choices[0].message.content || "";
    const containsHand = answer.toLowerCase().includes("yes");

    // Delete the image if no hand was detected
    if (!containsHand) {
      fastify.imageStorage.delete(imageId);
      return {
        containsHand,
        explanation: answer,
        imageId: null,
      };
    }

    return {
      containsHand,
      explanation: answer,
      imageId,
    };
  } catch (error) {
    // Delete image on error
    fastify.imageStorage.delete(imageId);
    throw error;
  }
};

export const processPalmReading = async (
  fastify: FastifyInstance,
  jobId: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> => {
  try {
    updateJob(jobId, {
      status: "processing",
      progress: 10,
      message: "Detecting hand in image...",
    });

    const result = await detectHand(fastify, buffer, mimeType);

    updateJob(jobId, {
      status: "processing",
      progress: 50,
      message: result.containsHand
        ? "Hand detected! Reading palm lines for predictions..."
        : "No hand detected",
    });

    if (!result.containsHand) {
      updateJob(jobId, {
        status: "completed",
        progress: 100,
        message: "Analysis complete",
        result,
      });
      return;
    }

    // Simulate palm lines analysis (replace with actual palm reading logic later)
    updateJob(jobId, {
      status: "processing",
      progress: 75,
      message: "Analyzing palm lines and making predictions...",
    });

    // Add a small delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    updateJob(jobId, {
      status: "completed",
      progress: 100,
      message: "Palm lines prediction complete!",
      result,
    });
  } catch (error) {
    updateJob(jobId, {
      status: "failed",
      progress: 0,
      message: "Failed to process palm reading",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
