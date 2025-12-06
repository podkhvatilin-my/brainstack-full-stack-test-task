import fp from "fastify-plugin";
import { type FastifyPluginAsync } from "fastify";

export type ImageData = {
  id: string;
  buffer: Buffer;
  mimetype: string;
  uploadedAt: Date;
};

const imageStore = new Map<string, ImageData>();

const imageStoragePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate("imageStorage", {
    save: (id: string, buffer: Buffer, mimetype: string): void => {
      imageStore.set(id, {
        id,
        buffer,
        mimetype,
        uploadedAt: new Date(),
      });
    },

    get: (id: string): ImageData | undefined => {
      return imageStore.get(id);
    },

    delete: (id: string): boolean => {
      return imageStore.delete(id);
    },

    clearOld: (maxAgeMs: number): number => {
      const now = Date.now();
      let deletedCount = 0;

      for (const [id, data] of imageStore.entries()) {
        if (now - data.uploadedAt.getTime() > maxAgeMs) {
          imageStore.delete(id);

          deletedCount++;
        }
      }

      return deletedCount;
    },
  });
};

export default fp(imageStoragePlugin, {
  name: "imageStorage",
});

declare module "fastify" {
  interface FastifyInstance {
    imageStorage: {
      save: (id: string, buffer: Buffer, mimetype: string) => void;
      get: (id: string) => ImageData | undefined;
      delete: (id: string) => boolean;
      clearOld: (maxAgeMs: number) => number;
    };
  }
}
