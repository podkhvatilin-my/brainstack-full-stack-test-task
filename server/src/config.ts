export const JOB_QUEUE = {
  MAX_JOBS: 1000,
  CLEANUP_INTERVAL_MS: 1000 * 60 * 5, // 5 minutes
  JOB_MAX_AGE_MS: 1000 * 60 * 15, // 15 minutes
  AGGRESSIVE_CLEANUP_AGE_MS: 1000 * 60 * 5, // 5 minutes (when queue is full)
};

export const MULTIPART = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
};

export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  TIME_WINDOW: "15 minutes",
};
