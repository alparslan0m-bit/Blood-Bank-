import { CheckCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { CheckWithRelations } from "@/types/database";

interface CheckTimelineProps {
  check: CheckWithRelations;
}

export function CheckTimeline({ check }: CheckTimelineProps) {
  const timelineSteps = [
    { label: "Created", ts: check.created_at, active: true },
    {
      label: "Transferred",
      ts: check.transferred_to_distributor_at,
      active: !!check.transferred_to_distributor_at,
    },
    {
      label: "Blood Recorded",
      ts: check.blood_recorded_at,
      active: !!check.blood_recorded_at,
    },
    {
      label: "Distributed",
      ts: check.distributed_at,
      active: !!check.distributed_at,
    },
    {
      label: "Completed",
      ts: check.status === "completed" ? check.updated_at : null,
      active: check.status === "completed",
    },
  ];

  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg">
      <h3 className="text-body-sm font-mono uppercase tracking-wider text-mute mb-lg">
        Check Progress Timeline
      </h3>
      <div className="flex flex-col md:flex-row gap-lg md:gap-none items-stretch md:items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-hairline -translate-y-1/2 hidden md:block z-0" />
        {timelineSteps.map((step, idx) => (
          <div
            key={step.label}
            className="flex md:flex-col items-center gap-sm md:gap-xs text-left md:text-center z-10 md:w-1/5 relative"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-mono text-caption ${
                step.active
                  ? "bg-primary border-primary text-on-primary font-bold"
                  : "bg-canvas border-hairline text-mute"
              }`}
            >
              {step.ts ? <CheckCircle className="h-4 w-4" /> : idx + 1}
            </div>
            <div className="flex flex-col md:items-center">
              <span
                className={`text-body-sm font-medium ${step.active ? "text-ink" : "text-mute"}`}
              >
                {step.label}
              </span>
              {step.ts && (
                <span className="text-[10px] text-mute font-mono">
                  {formatDateTime(step.ts)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
