import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-provider";
import { createCheckEvent } from "@/features/checks/api/check-events-api";

export function useCheckStatusActions(checkId: string) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [servePatientNotes, setServePatientNotes] = useState("");

  const eventMutation = useMutation({
    mutationFn: (payload: {
      eventType: string;
      actorRole: string;
      notes?: string;
      metadata?: Record<string, unknown>;
    }) =>
      createCheckEvent(
        checkId,
        payload.eventType,
        currentUser!.id,
        payload.actorRole,
        {
          notes: payload.notes,
          metadata: payload.metadata,
          device_info: { platform: "web", source: "admin_dashboard" },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checks", checkId] });
      queryClient.invalidateQueries({ queryKey: ["checks", checkId, "events"] });
      queryClient.invalidateQueries({ queryKey: ["checks"] });
    },
  });

  const runAction = async (payload: {
    eventType: string;
    actorRole: string;
    notes?: string;
    metadata?: Record<string, unknown>;
  }) => {
    if (!currentUser) return;
    setActionLoading(true);
    try {
      await eventMutation.mutateAsync(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = () => {
    if (!selectedDistributor) return;
    return runAction({
      eventType: "transferred",
      actorRole: "receiver",
      metadata: { distributor_id: selectedDistributor },
    });
  };

  const handleRecordBlood = () => {
    if (!selectedBloodType) return;
    return runAction({
      eventType: "blood_recorded",
      actorRole: "lab",
      metadata: { blood_type_id: parseInt(selectedBloodType, 10) },
    });
  };

  const handleServePatient = () => {
    if (!servePatientNotes.trim()) return;
    return runAction({
      eventType: "patient_served",
      actorRole: "distributor",
      notes: servePatientNotes.trim(),
    });
  };

  return {
    actionLoading,
    selectedBloodType,
    setSelectedBloodType,
    selectedDistributor,
    setSelectedDistributor,
    servePatientNotes,
    setServePatientNotes,
    handleTransfer,
    handleRecordBlood,
    handleServePatient,
  };
}
