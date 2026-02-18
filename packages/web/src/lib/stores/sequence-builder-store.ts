import { create } from "zustand";
import type { StepType, ConditionType } from "@relay/shared";

export interface BuilderStep {
  id: string;
  type: StepType;
  order: number;
  subject?: string | null;
  body?: string | null;
  delayMs?: number | null;
  conditionType?: ConditionType | null;
}

interface SequenceBuilderState {
  sequenceId: string | null;
  steps: BuilderStep[];
  selectedStepId: string | null;
  isDirty: boolean;

  setSequence: (id: string, steps: BuilderStep[]) => void;
  selectStep: (id: string | null) => void;
  addStep: (step: BuilderStep) => void;
  updateStep: (id: string, data: Partial<BuilderStep>) => void;
  removeStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  markClean: () => void;
  reset: () => void;
}

export const useSequenceBuilderStore = create<SequenceBuilderState>((set) => ({
  sequenceId: null,
  steps: [],
  selectedStepId: null,
  isDirty: false,

  setSequence: (id, steps) => set({ sequenceId: id, steps, selectedStepId: null, isDirty: false }),

  selectStep: (id) => set({ selectedStepId: id }),

  addStep: (step) =>
    set((state) => ({
      steps: [...state.steps, step],
      selectedStepId: step.id,
      isDirty: true,
    })),

  updateStep: (id, data) =>
    set((state) => ({
      steps: state.steps.map((s) => (s.id === id ? { ...s, ...data } : s)),
      isDirty: true,
    })),

  removeStep: (id) =>
    set((state) => {
      const filtered = state.steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i }));
      return {
        steps: filtered,
        selectedStepId: state.selectedStepId === id ? null : state.selectedStepId,
        isDirty: true,
      };
    }),

  reorderSteps: (fromIndex, toIndex) =>
    set((state) => {
      const items = [...state.steps];
      const [moved] = items.splice(fromIndex, 1);
      if (!moved) return state;
      items.splice(toIndex, 0, moved);
      return {
        steps: items.map((s, i) => ({ ...s, order: i })),
        isDirty: true,
      };
    }),

  markClean: () => set({ isDirty: false }),

  reset: () => set({ sequenceId: null, steps: [], selectedStepId: null, isDirty: false }),
}));
