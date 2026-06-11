import {
  useTotalDonors,
  useTotalPatients,
  useTotalChecks,
  useRareBloodDonors,
  useTodayDonations,
  useMonthlyDonations,
} from "@/features/dashboard/hooks/use-dashboard";
import { KpiCard } from "@/components/kpi-card";
import {
  Users,
  ClipboardCheck,
  Heart,
  Droplets,
  Calendar,
  Sparkles,
} from "lucide-react";

export function DashboardKpiGrid() {
  const { data: totalDonors, isLoading: loadingDonors } = useTotalDonors();
  const { data: totalPatients, isLoading: loadingPatients } =
    useTotalPatients();
  const { data: totalChecks, isLoading: loadingChecks } = useTotalChecks();
  const { data: rareDonors, isLoading: loadingRare } = useRareBloodDonors();
  const { data: todayDonations, isLoading: loadingToday } = useTodayDonations();
  const { data: monthlyDonations, isLoading: loadingMonthly } =
    useMonthlyDonations();

  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        title="Total Donors"
        value={totalDonors ?? 0}
        icon={Heart}
        accent="coral"
        description="Registered in the system"
        loading={loadingDonors}
      />
      <KpiCard
        title="Patients Served"
        value={totalPatients ?? 0}
        icon={Users}
        accent="teal"
        description="Active patient records"
        loading={loadingPatients}
      />
      <KpiCard
        title="Donation Checks"
        value={totalChecks ?? 0}
        icon={ClipboardCheck}
        accent="indigo"
        description="All lifecycle records"
        loading={loadingChecks}
      />
      <KpiCard
        title="Rare Blood Donors"
        value={rareDonors ?? 0}
        icon={Droplets}
        accent="violet"
        description="AB-, AB+, O- groups"
        loading={loadingRare}
      />
      <KpiCard
        title="Donations Today"
        value={todayDonations ?? 0}
        icon={Sparkles}
        accent="amber"
        description="Since midnight"
        loading={loadingToday}
      />
      <KpiCard
        title="This Month"
        value={monthlyDonations ?? 0}
        icon={Calendar}
        accent="coral"
        description="Current calendar month"
        loading={loadingMonthly}
      />
    </div>
  );
}
