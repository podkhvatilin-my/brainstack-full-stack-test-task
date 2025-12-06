import { randomUUID } from "crypto";

export const JOB_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;
export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export class Job<T = any> {
  public readonly id: string;
  public status: JobStatus;
  public progress: number;
  public message: string;
  public result?: T;
  public error?: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(id?: string) {
    this.id = id ?? randomUUID();
    this.status = JOB_STATUS.PENDING;
    this.progress = 0;
    this.message = "Job created";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  update(
    updates: Partial<
      Pick<Job<T>, "status" | "progress" | "message" | "result" | "error">
    >
  ): void {
    Object.assign(this, updates, { updatedAt: new Date() });
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      progress: this.progress,
      message: this.message,
      result: this.result,
      error: this.error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
