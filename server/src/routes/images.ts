import { randomUUID } from "crypto";
import { type FastifyPluginAsync } from "fastify";

export const imagesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({ error: "No file uploaded" });
    }

    const buffer = await data.toBuffer();
    const id = randomUUID();

    fastify.imageStorage.save(id, buffer, data.mimetype);

    return reply.code(201).send({
      id,
      message: "Image uploaded successfully",
    });
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const image = fastify.imageStorage.get(id);

    if (!image) {
      return reply.code(404).send({ error: "Image not found" });
    }

    reply.header("Content-Type", image.mimetype);
    return reply.send(image.buffer);
  });
};
