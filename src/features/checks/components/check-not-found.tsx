import { ShieldAlert } from "lucide-react";
import { NotFoundState } from "@/components/feedback/not-found-state";

export function CheckNotFound() {
  return (
    <NotFoundState
      icon={ShieldAlert}
      title="Check record not found"
      description="The check serial may be incorrect, or you may not have authorization to view it."
      backTo="/checks"
      backLabel="Back to Checks"
    />
  );
}
