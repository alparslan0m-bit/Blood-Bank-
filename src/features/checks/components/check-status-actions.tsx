import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useBloodTypes } from "@/hooks/use-blood-types";
import { useDistributorsForChecks } from "@/hooks/use-lookups";
import { getStatusConfig } from "@/lib/utils";
import type { CheckWithRelations } from "@/types/database";
import type { RoleUser } from "@/services/lookups-service";

const STATUS_FLOW = [
  "created",
  "transferred",
  "blood_recorded",
  "patient_served",
] as const;

interface CheckStatusActionsProps {
  check: CheckWithRelations;
  actionLoading: boolean;
  selectedBloodType: string;
  setSelectedBloodType: (value: string) => void;
  selectedDistributor: string;
  setSelectedDistributor: (value: string) => void;
  servePatientNotes: string;
  setServePatientNotes: (value: string) => void;
  onTransfer: () => void;
  onRecordBlood: () => void;
  onServePatient: () => void;
}

export function CheckStatusActions({
  check,
  actionLoading,
  selectedBloodType,
  setSelectedBloodType,
  selectedDistributor,
  setSelectedDistributor,
  servePatientNotes,
  setServePatientNotes,
  onTransfer,
  onRecordBlood,
  onServePatient,
}: CheckStatusActionsProps) {
  const { data: distributors } = useDistributorsForChecks();
  const { data: bloodTypes } = useBloodTypes();

  const currentIndex = Math.max(
    0,
    STATUS_FLOW.indexOf(check.status as (typeof STATUS_FLOW)[number]),
  );

  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline no-print">
      <div className="flex items-center justify-between mb-md border-b border-hairline pb-sm">
        <h3 className="text-body-md font-semibold text-ink">Status & Actions</h3>
        <StatusBadge status={check.status} />
      </div>

      <div className="mb-lg">
        <p className="text-caption font-mono uppercase tracking-wider text-mute mb-sm">
          Progress
        </p>
        <div className="flex items-center gap-xxs">
          {STATUS_FLOW.map((status, idx) => {
            const config = getStatusConfig(status);
            const isComplete = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={status} className="flex flex-1 items-center gap-xxs">
                <div
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    isComplete || isCurrent ? "bg-primary" : "bg-hairline"
                  } ${isCurrent ? "ring-2 ring-primary/20" : ""}`}
                  title={config.label}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-xs flex justify-between text-[10px] font-mono text-mute">
          <span>Created</span>
          <span>Served</span>
        </div>
      </div>

      <div className="space-y-sm">
        {check.status === "created" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full">
                Assign & Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Transfer to Distributor</DialogTitle>
              </DialogHeader>
              <div className="space-y-md py-4">
                <div className="space-y-xs">
                  <label className="text-caption font-semibold text-ink">
                    Choose Distributor
                  </label>
                  <Select
                    value={selectedDistributor}
                    onValueChange={setSelectedDistributor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select distributor staff..." />
                    </SelectTrigger>
                    <SelectContent>
                      {distributors?.map((d: RoleUser) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.full_name ?? d.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={onTransfer}
                  disabled={!selectedDistributor || actionLoading}
                  className="w-full"
                >
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Transfer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {check.status === "transferred" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full">
                Record Lab Results
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Lab Results</DialogTitle>
              </DialogHeader>
              <div className="space-y-md py-4">
                <div className="space-y-xs">
                  <label className="text-caption font-semibold text-ink">
                    Blood Group Verified
                  </label>
                  <Select
                    value={selectedBloodType}
                    onValueChange={setSelectedBloodType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select verified blood type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes?.map((bt) => (
                        <SelectItem key={bt.id} value={String(bt.id)}>
                          {bt.label} {bt.is_rare ? "(Rare)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={onRecordBlood}
                  disabled={!selectedBloodType || actionLoading}
                  className="w-full"
                >
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Record and Verify
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {check.status === "blood_recorded" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full">
                Confirm Patient Served
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Patient Delivery Confirmation</DialogTitle>
              </DialogHeader>
              <div className="space-y-md py-4">
                <div className="space-y-xs">
                  <label className="text-caption font-semibold text-ink">
                    Delivery Notes (required)
                  </label>
                  <textarea
                    value={servePatientNotes}
                    onChange={(e) => setServePatientNotes(e.target.value)}
                    placeholder="Patient confirmed receipt. Ward, bed, nurse name..."
                    rows={4}
                    className="flex w-full rounded-sm border border-hairline bg-canvas px-sm py-xs text-body-sm text-ink placeholder:text-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link"
                  />
                </div>
                <Button
                  onClick={onServePatient}
                  disabled={!servePatientNotes.trim() || actionLoading}
                  className="w-full"
                >
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign Patient Served
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {check.status === "patient_served" && (
          <p className="text-body-sm text-mute text-center py-sm">
            Patient has been served. This check is closed.
          </p>
        )}
      </div>
    </div>
  );
}
