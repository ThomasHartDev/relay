"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Workflow, Keyboard, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "Manage your contacts",
    description:
      "Import contacts, track companies, and manage your pipeline — all in one place. Create deals, log activities, and never lose track of a relationship.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: <Workflow className="h-8 w-8" />,
    title: "Automate your workflow",
    description:
      "Build email sequences and visual workflows to automate repetitive tasks. Set triggers, conditions, and actions — then let the system work for you.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: <Keyboard className="h-8 w-8" />,
    title: "Work at lightning speed",
    description:
      "Press ⌘K for the command palette, G then C to jump to contacts, or ? to see all shortcuts. Everything is keyboard-accessible for power users.",
    color: "text-amber-600 bg-amber-50",
  },
];

export function OnboardingWizard() {
  const { onboardingComplete, onboardingStep, setOnboardingStep, completeOnboarding } =
    useUIStore();

  if (onboardingComplete) return null;

  const step = STEPS[onboardingStep];
  const isLast = onboardingStep === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      completeOnboarding();
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  }

  function handleSkip() {
    completeOnboarding();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-2xl"
      >
        {/* Step indicator */}
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= onboardingStep ? "bg-brand-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step && (
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`mb-4 rounded-xl p-4 ${step.color}`}>{step.icon}</div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">{step.title}</h2>
              <p className="mb-8 text-sm leading-relaxed text-gray-500">{step.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            Skip
          </button>
          <Button onClick={handleNext} className="gap-2">
            {isLast ? (
              <>
                Get started
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Completion animation */}
        {isLast && (
          <div className="absolute -top-2 right-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100"
            >
              <Check className="h-4 w-4 text-green-600" />
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
