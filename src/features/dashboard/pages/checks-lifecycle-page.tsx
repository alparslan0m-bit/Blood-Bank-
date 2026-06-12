import { PageHeader } from "@/components/page-header";
import { LifecycleChecksPanel } from "@/features/dashboard/components/lifecycle-checks-panel";

export function ChecksLifecyclePage() {
  return (
    <div className="space-y-xl">
      <PageHeader
        title="Check Lifecycle"
        description="Review checks by stage, filter bottlenecks, and open any profile to act."
      />
      <LifecycleChecksPanel />
    </div>
  );
}
