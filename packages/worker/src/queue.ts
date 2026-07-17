import { Queue, type JobsOptions } from "bullmq";
import IORedis, { type Redis } from "ioredis";
import {
  JOB_NAMES,
  type JobName,
  type SequenceStepPayload,
  type WorkflowDelayPayload,
} from "./payloads";

export const QUEUE_NAME = "relay-jobs";

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5_000 },
  removeOnComplete: 1_000,
  removeOnFail: 5_000,
};

// Redis rejects a huge range; clamp anything unbounded to a sane one-year ceiling.
const MAX_DELAY_MS = 365 * 24 * 60 * 60 * 1_000;

export function resolveDelayMs(ms: number | undefined | null): number {
  if (ms == null || !Number.isFinite(ms) || ms <= 0) return 0;
  return Math.min(Math.floor(ms), MAX_DELAY_MS);
}

// Deterministic ids make enqueue idempotent: BullMQ drops a second add for a
// job that's already waiting, so a retried trigger can't double-schedule.
export function sequenceStepJobId(payload: SequenceStepPayload): string {
  return `seq:${payload.enrollmentId}:${payload.stepId}`;
}

export function workflowDelayJobId(payload: WorkflowDelayPayload): string {
  return `wf:${payload.executionId}:${payload.nodeId}`;
}

export function buildJobOptions(jobId: string, delayMs: number): JobsOptions {
  return { ...DEFAULT_JOB_OPTIONS, jobId, delay: resolveDelayMs(delayMs) };
}

export interface Enqueuer {
  add(name: JobName, data: unknown, opts?: JobsOptions): Promise<unknown>;
}

export function enqueueSequenceStep(
  queue: Enqueuer,
  payload: SequenceStepPayload,
  delayMs = 0,
): Promise<unknown> {
  return queue.add(
    JOB_NAMES.sequenceStep,
    payload,
    buildJobOptions(sequenceStepJobId(payload), delayMs),
  );
}

export function enqueueWorkflowDelay(
  queue: Enqueuer,
  payload: WorkflowDelayPayload,
  delayMs: number,
): Promise<unknown> {
  return queue.add(
    JOB_NAMES.workflowDelay,
    payload,
    buildJobOptions(workflowDelayJobId(payload), delayMs),
  );
}

// bullmq workers require maxRetriesPerRequest: null on the shared connection.
export function createConnection(url = process.env.REDIS_URL): Redis {
  if (!url) throw new Error("REDIS_URL is not set");
  return new IORedis(url, { maxRetriesPerRequest: null });
}

export function createQueue(connection: Redis): Queue {
  return new Queue(QUEUE_NAME, { connection, defaultJobOptions: DEFAULT_JOB_OPTIONS });
}
