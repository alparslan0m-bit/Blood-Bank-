import { Skeleton } from "@/components/ui/skeleton";

function SkeletonRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-hairline last:border-0">
      {children}
    </tr>
  );
}

function SkeletonCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-md py-sm ${className ?? ""}`}>{children}</td>;
}

export function ChecksTableSkeletonBody({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow key={index}>
          <SkeletonCell>
            <Skeleton className="h-4 w-28" />
          </SkeletonCell>
          <SkeletonCell>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SkeletonCell>
          <SkeletonCell>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-6 w-14 rounded-full" />
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-4 w-24" />
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-4 w-20" />
          </SkeletonCell>
        </SkeletonRow>
      ))}
    </>
  );
}

export function DonorsTableSkeletonBody({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow key={index}>
          <SkeletonCell>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-6 w-14 rounded-full" />
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-4 w-28" />
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-4 w-16" />
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-4 w-20" />
          </SkeletonCell>
          <SkeletonCell>
            <Skeleton className="h-4 w-24" />
          </SkeletonCell>
        </SkeletonRow>
      ))}
    </>
  );
}
