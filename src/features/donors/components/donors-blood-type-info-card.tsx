import { Droplets } from "lucide-react";
import { useBloodTypes } from "@/hooks/use-blood-types";
import { Skeleton } from "@/components/ui/skeleton";

/** Reference population distribution — shown until donor data is available. */
const REFERENCE_SHARES: Record<string, number> = {
  "A+": 30,
  "A-": 6,
  "B+": 18,
  "B-": 2,
  "AB+": 4,
  "AB-": 1,
  "O+": 28,
  "O-": 11,
};

export function DonorsBloodTypeInfoCard() {
  const { data: bloodTypes, isLoading } = useBloodTypes();

  return (
    <section className="rounded-md border border-hairline bg-canvas-soft p-lg">
      <div className="mb-md flex items-center gap-sm border-b border-hairline pb-sm">
        <Droplets className="h-5 w-5 text-mute" aria-hidden />
        <div>
          <h3 className="text-body-sm font-semibold text-ink">
            Blood type reference
          </h3>
          <p className="text-caption text-mute">
            Typical population distribution — your registry will reflect actual
            donors as they are registered.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
          {(bloodTypes ?? []).map((type) => {
            const share = REFERENCE_SHARES[type.code] ?? 0;

            return (
              <div
                key={type.id}
                className="rounded-sm border border-hairline bg-canvas px-sm py-xs"
              >
                <div className="flex items-center justify-between gap-xs">
                  <span className="font-mono text-body-sm font-semibold text-ink">
                    {type.code}
                  </span>
                  <span className="text-caption text-mute">{share}%</span>
                </div>
                <div className="mt-xs h-1.5 overflow-hidden rounded-full bg-canvas-soft-2">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${share}%` }}
                  />
                </div>
                {type.is_rare && (
                  <span className="mt-xxs block text-[10px] font-mono uppercase text-warning-deep">
                    Rare
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
