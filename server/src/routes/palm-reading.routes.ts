import { type FastifyPluginAsync } from "fastify";
import { processPalmReading } from "../services/palm-reading.service";
import {
  createJob,
  getJob,
  subscribeToJob,
} from "../services/job-queue.service";

export const palmReadingRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/start", async (request, reply) => {
    try {
      const data = await request.file();

      if (!data) {
        return reply.code(400).send({ error: "No image provided" });
      }

      const buffer = await data.toBuffer();
      const jobId = createJob();

      processPalmReading(fastify, jobId, buffer, data.mimetype).catch(
        (error) => {
          fastify.log.error("Palm reading job failed:", error);
        }
      );

      return reply.code(201).send({ jobId });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: "Failed to start palm reading" });
    }
  });

  fastify.get("/progress/:jobId", { sse: true }, async (request, reply) => {
    const { jobId } = request.params as { jobId: string };

    const job = getJob(jobId);

    if (!job) {
      return reply.code(404).send({ error: "Job not found" });
    }

    reply.sse.keepAlive();

    await reply.sse.send({ data: job });

    const unsubscribe = subscribeToJob(jobId, async (updatedJob) => {
      await reply.sse.send({ data: updatedJob });

      if (updatedJob.status === "completed" || updatedJob.status === "failed") {
        unsubscribe();
      }
    });

    reply.sse.onClose(() => {
      unsubscribe();
    });
  });
};
