import { useMemo } from "react";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import { CHART_TOOLTIP_STYLE } from "@/features/dashboard/constants/chart-styles";
import { groupChecksByMonth } from "@/features/donors/utils/donor-stats";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
} from "recharts";

interface DonorDonationChartProps {
  checks: { created_at: string }[] | undefined;
  loading?: boolean;
}

export function DonorDonationChart({
  checks,
  loading,
}: DonorDonationChartProps) {
  const chartData = useMemo(() => groupChecksByMonth(checks ?? []), [checks]);
  const hasData = chartData.length > 0;

  return (
    <DashboardPanel
      title="Donation history"
      description="Checks recorded per month for this donor"
      loading={loading}
    >
      <div className="h-[160px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
            >
              <RechartsTooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                cursor={{ fill: "var(--color-canvas-soft)" }}
              />
              <Bar
                dataKey="count"
                name="Donations"
                fill="var(--color-teal)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-md text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-soft-2 mb-4">
              <EntityEmptyIcon entity="checks" className="h-5 w-5" />
            </div>
            <h3 className="text-body-sm font-medium text-ink mb-1">
              No donation history
            </h3>
            <p className="text-caption text-mute max-w-sm">
              Monthly activity will appear once checks are linked.
            </p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}
