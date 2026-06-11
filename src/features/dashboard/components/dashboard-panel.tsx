import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardPanelProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function DashboardPanel({
  title,
  description,
  action,
  loading,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "rounded-md border border-hairline bg-canvas shadow-level-2 p-lg",
        className,
      )}
    >
      <header className="mb-lg flex items-start justify-between gap-md">
        <div className="min-w-0">
          <h3 className="text-body-md font-semibold text-ink">{title}</h3>
          {description && (
            <p className="mt-0.5 text-caption text-mute">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading chart">
          <Skeleton className="h-[220px] w-full rounded-sm" />
        </div>
      ) : (
        children
      )}
    </section>
  );
}
