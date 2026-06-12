import { CheckCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CheckWithRelations, User } from "@/types/database";

interface CheckTimelineProps {
  check: CheckWithRelations;
}

interface TimelineStep {
  label: string;
  ts: string | null;
  active: boolean;
  actor: string | null;
}

function getUserName(user: User | null | undefined): string | null {
  if (!user) return null;
  return user.full_name ?? user.username ?? null;
}

export function CheckTimeline({ check }: CheckTimelineProps) {
  const timelineSteps: TimelineStep[] = [
    {
      label: "Created",
      ts: check.created_at,
      active: true,
      actor: getUserName(check.created_by_user as User | null),
    },
    {
      label: "Transferred",
      ts: check.transferred_to_distributor_at,
      active: !!check.transferred_to_distributor_at,
      actor: getUserName(check.created_by_user as User | null),
    },
    {
      label: "Blood Recorded",
      ts: check.blood_recorded_at,
      active: !!check.blood_recorded_at,
      actor: getUserName(check.blood_recorder as User | null),
    },
    {
      label: "Patient Served",
      ts: check.patient_served_at,
      active: !!check.patient_served_at,
      actor: getUserName(check.patient_server as User | null),
    },
  ];

  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg">
      <h3 className="text-body-sm font-mono uppercase tracking-wider text-mute mb-lg">
        Check Progress Timeline
      </h3>
      <div className="flex flex-col gap-lg md:flex-row md:gap-none items-stretch md:items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-hairline -translate-y-1/2 hidden md:block z-0" />
        {timelineSteps.map((step, idx) => (
          <Tooltip key={step.label}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex md:flex-col items-center gap-sm md:gap-xs text-left md:text-center z-10 md:flex-1 relative rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-mono text-caption transition-colors shrink-0 ${
                    step.active
                      ? "bg-primary border-primary text-on-primary font-bold"
                      : "bg-canvas border-hairline text-mute"
                  }`}
                >
                  {step.ts ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="flex flex-col md:items-center min-w-0">
                  <span
                    className={`text-body-sm font-medium ${step.active ? "text-ink" : "text-mute"}`}
                  >
                    {step.label}
                  </span>
                  {step.ts && (
                    <span className="text-[10px] text-mute font-mono md:hidden">
                      {formatDateTime(step.ts)}
                    </span>
                  )}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-center">
              {step.ts ? (
                <div className="space-y-0.5">
                  <p className="font-medium">{step.label}</p>
                  <p className="text-[11px] opacity-90">
                    {formatDateTime(step.ts)}
                  </p>
                  {step.actor && (
                    <p className="text-[11px] opacity-75">by {step.actor}</p>
                  )}
                </div>
              ) : (
                <p className="text-[11px]">Pending — not yet completed</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
