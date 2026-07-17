import { z } from "zod";

export const JOB_NAMES = {
  sequenceStep: "sequence-step",
  workflowDelay: "workflow-delay",
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

export const sequenceStepPayloadSchema = z.object({
  enrollmentId: z.string().cuid(),
  sequenceId: z.string().cuid(),
  stepId: z.string().cuid(),
});

export const workflowDelayPayloadSchema = z.object({
  executionId: z.string().cuid(),
  workflowId: z.string().cuid(),
  nodeId: z.string().cuid(),
});

export type SequenceStepPayload = z.infer<typeof sequenceStepPayloadSchema>;
export type WorkflowDelayPayload = z.infer<typeof workflowDelayPayloadSchema>;

export interface JobPayloads {
  [JOB_NAMES.sequenceStep]: SequenceStepPayload;
  [JOB_NAMES.workflowDelay]: WorkflowDelayPayload;
}

export const JOB_PAYLOAD_SCHEMAS = {
  [JOB_NAMES.sequenceStep]: sequenceStepPayloadSchema,
  [JOB_NAMES.workflowDelay]: workflowDelayPayloadSchema,
} satisfies { [N in JobName]: z.ZodType<JobPayloads[N]> };

export function isJobName(name: string): name is JobName {
  return name === JOB_NAMES.sequenceStep || name === JOB_NAMES.workflowDelay;
}
