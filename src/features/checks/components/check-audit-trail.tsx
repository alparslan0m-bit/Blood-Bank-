import { useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { useEntityActivities } from "@/hooks/use-activities";
import { formatDateTime, formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types/database";

interface CheckAuditTrailProps {
  checkId: string;
}

export function CheckAuditTrail({ checkId }: CheckAuditTrailProps) {
  const [open, setOpen] = useState(false);
  const { data: activities, isLoading, isError } = useEntityActivities(
    checkId,
    5,
  );

  return (
    <div className="rounded-md bg-canvas shadow-level-2 border border-hairline overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between p-lg text-left hover:bg-canvas-soft transition-colors"
        aria-expanded={open}
      >
        <span className="text-body-md font-semibold text-ink flex items-center gap-sm">
          <History className="h-5 w-5 text-mute" />
          Audit Trail
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-mute transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-hairline px-lg pb-lg">
          {isLoading ? (
            <p className="py-md text-body-sm text-mute">Loading audit events…</p>
          ) : isError ? (
            <p className="py-md text-body-sm text-mute">
              Audit trail unavailable. Activity logging may be restricted.
            </p>
          ) : !activities?.length ? (
            <p className="py-md text-body-sm text-mute">
              No audit events recorded for this check.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {activities.map((activity: Activity) => (
                <li key={activity.id} className="py-sm first:pt-md">
                  <div className="flex items-start justify-between gap-sm">
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-ink capitalize">
                        {activity.action.replace(/_/g, " ")}
                      </p>
                      {activity.details && (
                        <p className="text-caption text-mute mt-0.5 truncate">
                          {activity.details}
                        </p>
                      )}
                      {activity.user && (
                        <p className="text-caption text-mute mt-0.5">
                          {activity.user.full_name ?? activity.user.username}
                        </p>
                      )}
                    </div>
                    <time
                      className="shrink-0 text-caption font-mono text-mute text-right"
                      dateTime={activity.created_at}
                      title={formatDateTime(activity.created_at)}
                    >
                      {formatRelative(activity.created_at)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
