import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col">
          <div className="p-3 bg-muted rounded-t-lg border-b">
            <Skeleton className="h-7 w-32" />
          </div>
          <div className="p-3 space-y-4 rounded-b-lg bg-muted/50 min-h-[500px]">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="p-4 bg-card rounded-lg space-y-3 border">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-full" />
                 <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                 </div>
                 <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
