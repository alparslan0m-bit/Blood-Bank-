import { PageHeader } from "@/components/page-header";
import { DashboardSectionHeading } from "@/features/dashboard/components/dashboard-section-heading";
import { DashboardKpiGrid } from "@/features/dashboard/components/dashboard-kpi-grid";
import { DonationsTrendChart } from "@/features/dashboard/components/donations-trend-chart";
import { BloodReserveChart } from "@/features/dashboard/components/blood-reserve-chart";
import { DepartmentsChart } from "@/features/dashboard/components/departments-chart";
import { TopDonorsList } from "@/features/dashboard/components/top-donors-list";

export function DashboardPage() {
  return (
    <div className="space-y-xl">
      <PageHeader
        title="Operations Control"
        description="Live snapshot of donors, patients, checks, and distribution activity."
      />

      <section aria-labelledby="dashboard-kpis-heading">
        <DashboardSectionHeading
          id="dashboard-kpis-heading"
          title="Key metrics"
          description="Counts refresh every five minutes."
        />
        <DashboardKpiGrid />
      </section>

      <section aria-labelledby="dashboard-analytics-heading">
        <DashboardSectionHeading
          id="dashboard-analytics-heading"
          title="Analytics"
          description="Trends and distribution across the blood bank network."
        />
        <div className="grid grid-cols-1 gap-lg xl:grid-cols-3">
          <div className="space-y-lg xl:col-span-2">
            <DonationsTrendChart />
            <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
              <BloodReserveChart />
              <DepartmentsChart />
            </div>
          </div>

          <TopDonorsList />
        </div>
      </section>
    </div>
  );
}
