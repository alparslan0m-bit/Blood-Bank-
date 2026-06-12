import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useStaleChecks } from "@/features/dashboard/hooks/use-dashboard";
import { Button } from "@/components/ui/button";

export function StaleChecksAlert() {
  const { data, isLoading } = useStaleChecks();

  if (isLoading || !data?.count) return null;

  return (
    <div className="rounded-md border border-error/40 bg-error-soft p-lg">
      <div className="flex items-start gap-md">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-error/10 text-error-deep">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-body-md font-semibold text-error-deep">
            {data.count} stale check{data.count === 1 ? "" : "s"} (&gt;24h in Created)
          </h3>
          <p className="mt-xs text-body-sm text-body">
            These checks were created but never transferred. Review and follow up with receivers.
          </p>
          {data.items.length > 0 && (
            <ul className="mt-md space-y-xs">
              {data.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-sm text-body-sm"
                >
                  <Link
                    to={`/checks/${item.id}`}
                    className="font-mono font-medium text-link hover:underline"
                  >
                    {item.serial}
                  </Link>
                  <span className="text-caption text-mute">
                    {item.created_by_name} · {Math.round(item.hours_stale)}h
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-md">
            <Link to="/checks-lifecycle?bucket=stale">
              View all stale checks
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
