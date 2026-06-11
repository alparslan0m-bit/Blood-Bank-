import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-provider";
import { updateCheck } from "@/features/checks/api/checks-api";

export function useCheckStatusActions(checkId: string) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      updateCheck(checkId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checks", checkId] });
      queryClient.invalidateQueries({ queryKey: ["checks"] });
    },
  });

  const runAction = async (payload: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      await updateStatusMutation.mutateAsync(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = () => {
    if (!selectedDistributor) return;
    return runAction({
      status: "transferred",
      distributor_id: selectedDistributor,
      transferred_to_distributor_at: new Date().toISOString(),
    });
  };

  const handleRecordBlood = () => {
    if (!selectedBloodType || !currentUser) return;
    return runAction({
      status: "blood_recorded",
      blood_type_id: parseInt(selectedBloodType),
      blood_recorded_by: currentUser.id,
      blood_recorded_at: new Date().toISOString(),
    });
  };

  const handleDistribute = () =>
    runAction({
      status: "distributed",
      distributed_at: new Date().toISOString(),
    });

  const handleComplete = () => runAction({ status: "completed" });

  return {
    actionLoading,
    selectedBloodType,
    setSelectedBloodType,
    selectedDistributor,
    setSelectedDistributor,
    handleTransfer,
    handleRecordBlood,
    handleDistribute,
    handleComplete,
  };
}
