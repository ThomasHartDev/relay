import { JOB_PAYLOAD_SCHEMAS, isJobName, type JobName, type JobPayloads } from "./payloads";

export class UnknownJobError extends Error {
  constructor(public readonly jobName: string) {
    super(`No handler registered for job "${jobName}"`);
    this.name = "UnknownJobError";
  }
}

export type JobHandler<N extends JobName> = (payload: JobPayloads[N]) => Promise<void>;

type AnyHandler = (payload: unknown) => Promise<void>;

export class JobDispatcher {
  private readonly handlers = new Map<JobName, AnyHandler>();

  on<N extends JobName>(name: N, handler: JobHandler<N>): this {
    this.handlers.set(name, handler as AnyHandler);
    return this;
  }

  handles(name: string): name is JobName {
    return isJobName(name) && this.handlers.has(name);
  }

  // Throws on unknown name or invalid payload so BullMQ marks the job failed and
  // retries it under the queue's backoff policy rather than silently dropping it.
  async dispatch(name: string, data: unknown): Promise<void> {
    if (!isJobName(name)) throw new UnknownJobError(name);
    const handler = this.handlers.get(name);
    if (!handler) throw new UnknownJobError(name);
    const payload = JOB_PAYLOAD_SCHEMAS[name].parse(data);
    await handler(payload);
  }
}
