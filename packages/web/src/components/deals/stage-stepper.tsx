"use client";

import { cn } from "@/lib/cn";
import { DEAL_STAGES, DEAL_STAGE_CONFIG, type DealStage } from "@relay/shared";

interface StageStepperProps {
  currentStage: DealStage;
  onStageChange: (stage: DealStage) => void;
}

export function StageStepper({ currentStage, onStageChange }: StageStepperProps) {
  const currentIndex = DEAL_STAGES.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1">
      {DEAL_STAGES.map((stage, index) => {
        const config = DEAL_STAGE_CONFIG[stage];
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        const isWon = stage === "WON" && currentStage === "WON";
        const isLost = stage === "LOST" && currentStage === "LOST";

        return (
          <button
            key={stage}
            onClick={() => onStageChange(stage)}
            className={cn(
              "flex h-9 items-center justify-center rounded-md px-3 text-xs font-medium transition-all",
              "first:rounded-l-full last:rounded-r-full",
              isActive && "ring-2 ring-offset-1",
              isWon && "bg-green-100 text-green-700 ring-green-400",
              isLost && "bg-red-100 text-red-700 ring-red-400",
              isActive && !isWon && !isLost && "text-white",
              isPast && !isActive && "text-white opacity-80",
              !isActive &&
                !isPast &&
                !isWon &&
                !isLost &&
                "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
            style={
              isActive && !isWon && !isLost
                ? { backgroundColor: config.color }
                : isPast
                  ? { backgroundColor: config.color }
                  : undefined
            }
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
