import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { type LucideIcon } from "lucide-react";

type KpiAccent = "coral" | "teal" | "indigo" | "amber" | "violet";

const ACCENT_STYLES: Record<KpiAccent, string> = {
  coral: "bg-coral-soft text-coral-deep",
  teal: "bg-teal-soft text-teal-deep",
  indigo: "bg-indigo-soft text-indigo-deep",
  amber: "bg-amber-soft text-amber-deep",
  violet: "bg-violet-soft text-violet",
};

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  loading?: boolean;
  accent?: KpiAccent;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
  accent = "coral",
  className,
}: KpiCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div
      className={cn(
        "rounded-md border border-hairline bg-canvas p-lg shadow-level-2 transition-colors hover:border-hairline-strong",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-caption font-mono uppercase tracking-wide text-mute">
          {title}
        </span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            ACCENT_STYLES[accent],
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      {loading ? (
        <>
          <Skeleton className="mb-1 h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <p className="text-display-md tabular-nums text-ink">
            {formattedValue}
          </p>
          {description && (
            <p className="mt-1 text-caption text-mute">{description}</p>
          )}
        </>
      )}
    </div>
  );
}
