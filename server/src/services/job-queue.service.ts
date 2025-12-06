import { EventEmitter } from "events";
import { Job, JOB_STATUS } from "../models/job.model";
import { JOB_QUEUE } from "../config";

const jobEmitter = new EventEmitter();
const jobs = new Map<string, Job>();

export const createJob = (): string => {
  if (jobs.size >= JOB_QUEUE.MAX_JOBS) {
    cleanupOldJobs(JOB_QUEUE.AGGRESSIVE_CLEANUP_AGE_MS);

    if (jobs.size >= JOB_QUEUE.MAX_JOBS) {
      throw new Error("Job queue is full");
    }
  }

  const job = new Job();

  jobs.set(job.id, job);
  jobEmitter.emit(`job:${job.id}`, job);

  return job.id;
};

export const getJob = (id: string): Job | undefined => {
  return jobs.get(id);
};

export const updateJob = (
  id: string,
  updates: Partial<
    Pick<Job, "status" | "progress" | "message" | "result" | "error">
  >
): void => {
  const job = jobs.get(id);
  if (!job) return;

  job.update(updates);
  jobs.set(id, job);
  jobEmitter.emit(`job:${id}`, job);
};

export const deleteJob = (id: string): void => {
  jobs.delete(id);
};

export const subscribeToJob = (
  id: string,
  callback: (job: Job) => void
): (() => void) => {
  const listener = (job: Job) => callback(job);

  jobEmitter.on(`job:${id}`, listener);

  return () => jobEmitter.off(`job:${id}`, listener);
};

export const cleanupOldJobs = (
  maxAgeMs: number = JOB_QUEUE.JOB_MAX_AGE_MS
): void => {
  const now = Date.now();

  for (const [id, job] of jobs.entries()) {
    if (
      (job.status === JOB_STATUS.COMPLETED ||
        job.status === JOB_STATUS.FAILED) &&
      now - job.updatedAt.getTime() > maxAgeMs
    ) {
      jobs.delete(id);
      jobEmitter.removeAllListeners(`job:${id}`);
    }
  }
};

setInterval(() => {
  cleanupOldJobs();
}, JOB_QUEUE.CLEANUP_INTERVAL_MS);
