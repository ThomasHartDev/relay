import { Skeleton } from "@/components/ui/skeleton";

export default function WorkflowDetailLoading() {
  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="min-h-0 flex-1" />
    </div>
  );
}
