import { Worker, type Job } from "bullmq";
import type { Redis } from "ioredis";
import { JobDispatcher } from "./dispatcher";
import { QUEUE_NAME } from "./queue";

export * from "./payloads";
export * from "./queue";
export * from "./dispatcher";

export interface WorkerOptions {
  connection: Redis;
  concurrency?: number;
}

export function createWorker(dispatcher: JobDispatcher, opts: WorkerOptions): Worker {
  return new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      await dispatcher.dispatch(job.name, job.data);
    },
    { connection: opts.connection, concurrency: opts.concurrency ?? 5 },
  );
}
