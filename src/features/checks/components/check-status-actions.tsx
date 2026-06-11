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
import { useBloodTypes } from "@/hooks/use-blood-types";
import { useDistributorsForChecks } from "@/hooks/use-lookups";
import type { CheckWithRelations } from "@/types/database";
import type { RoleUser } from "@/services/lookups-service";

interface CheckStatusActionsProps {
  check: CheckWithRelations;
  actionLoading: boolean;
  selectedBloodType: string;
  setSelectedBloodType: (value: string) => void;
  selectedDistributor: string;
  setSelectedDistributor: (value: string) => void;
  onTransfer: () => void;
  onRecordBlood: () => void;
  onDistribute: () => void;
  onComplete: () => void;
}

export function CheckStatusActions({
  check,
  actionLoading,
  selectedBloodType,
  setSelectedBloodType,
  selectedDistributor,
  setSelectedDistributor,
  onTransfer,
  onRecordBlood,
  onDistribute,
  onComplete,
}: CheckStatusActionsProps) {
  const { data: distributors } = useDistributorsForChecks();
  const { data: bloodTypes } = useBloodTypes();

  return (
    <>
      {check.status === "created" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Assign & Transfer</Button>
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
            <Button size="sm">Record Lab Results</Button>
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
        <Button size="sm" onClick={onDistribute} disabled={actionLoading}>
          {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Mark Distributed
        </Button>
      )}

      {check.status === "distributed" && (
        <Button size="sm" onClick={onComplete} disabled={actionLoading}>
          {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Check
        </Button>
      )}
    </>
  );
}
