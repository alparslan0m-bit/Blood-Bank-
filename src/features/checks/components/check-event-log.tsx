import { useState } from "react";
import { ChevronDown, Fingerprint } from "lucide-react";
import { useCheckEvents } from "@/features/checks/hooks/use-check-events";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime, formatRelative, cn } from "@/lib/utils";

interface CheckEventLogProps {
  checkId: string;
}

function formatDeviceInfo(deviceInfo: Record<string, unknown> | null): string {
  if (!deviceInfo) return "—";
  const platform = deviceInfo.platform ?? deviceInfo.source;
  const version = deviceInfo.version;
  if (platform && version) return `${platform} ${version}`;
  if (platform) return String(platform);
  return "—";
}

export function CheckEventLog({ checkId }: CheckEventLogProps) {
  const [open, setOpen] = useState(true);
  const { data: events, isLoading, isError } = useCheckEvents(checkId);

  return (
    <div className="rounded-md bg-canvas shadow-level-2 border border-hairline overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between p-lg text-left hover:bg-canvas-soft transition-colors"
        aria-expanded={open}
      >
        <span className="text-body-md font-semibold text-ink flex items-center gap-sm">
          <Fingerprint className="h-5 w-5 text-mute" />
          Signed Event Log
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
            <p className="py-md text-body-sm text-mute">Loading signed events…</p>
          ) : isError ? (
            <p className="py-md text-body-sm text-mute">
              Event log unavailable. Run V3 migrations to enable check_events.
            </p>
          ) : !events?.length ? (
            <p className="py-md text-body-sm text-mute">
              No signed handoff events recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {events.map((event) => (
                <li key={event.id} className="py-md first:pt-md">
                  <div className="flex items-start justify-between gap-sm mb-xs">
                    <StatusBadge status={event.event_type} />
                    <time
                      className="shrink-0 text-caption font-mono text-mute text-right"
                      dateTime={event.created_at}
                      title={formatDateTime(event.created_at)}
                    >
                      {formatRelative(event.created_at)}
                    </time>
                  </div>
                  <p className="text-body-sm text-ink">
                    {event.actor?.full_name ?? event.actor?.username ?? "Unknown"}{" "}
                    <span className="text-mute">({event.actor_role})</span>
                  </p>
                  <p className="text-caption text-mute mt-0.5">
                    {formatDateTime(event.created_at)} · Device:{" "}
                    {formatDeviceInfo(event.device_info)}
                  </p>
                  {event.notes && (
                    <p className="text-body-sm text-body mt-xs">{event.notes}</p>
                  )}
                  <p className="text-[10px] font-mono text-mute mt-xs">
                    Event ID …{event.id.slice(-8)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
