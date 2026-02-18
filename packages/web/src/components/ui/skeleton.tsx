import { cn } from "@/lib/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-skeleton-pulse rounded-md bg-gray-200", className)} {...props} />
  );
}

export { Skeleton };
