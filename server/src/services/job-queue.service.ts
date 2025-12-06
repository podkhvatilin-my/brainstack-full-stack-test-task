import { randomUUID } from "crypto";
import { EventEmitter } from "events";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Job<T = any> {
  id: string;
  status: JobStatus;
  progress: number;
  message: string;
  result?: T;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobEmitter = new EventEmitter();
const jobs = new Map<string, Job>();

export const createJob = (): string => {
  const id = randomUUID();
  const job: Job = {
    id,
    status: "pending",
    progress: 0,
    message: "Job created",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.set(id, job);
  jobEmitter.emit(`job:${id}`, job);
  return id;
};

export const getJob = (id: string): Job | undefined => {
  return jobs.get(id);
};

export const updateJob = (
  id: string,
  updates: Partial<Pick<Job, "status" | "progress" | "message" | "result" | "error">>
): void => {
  const job = jobs.get(id);
  if (!job) return;

  Object.assign(job, updates, { updatedAt: new Date() });
  jobs.set(id, job);
  jobEmitter.emit(`job:${id}`, job);
};

export const deleteJob = (id: string): void => {
  jobs.delete(id);
};

export const subscribeToJob = (id: string, callback: (job: Job) => void): (() => void) => {
  const listener = (job: Job) => callback(job);
  jobEmitter.on(`job:${id}`, listener);
  
  // Return unsubscribe function
  return () => jobEmitter.off(`job:${id}`, listener);
};

// Clean up old completed/failed jobs
export const cleanupOldJobs = (maxAgeMs: number = 1000 * 60 * 60): void => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (
      (job.status === "completed" || job.status === "failed") &&
      now - job.updatedAt.getTime() > maxAgeMs
    ) {
      jobs.delete(id);
    }
  }
};

// Cleanup old jobs every 10 minutes
setInterval(() => {
  cleanupOldJobs();
}, 1000 * 60 * 10);
