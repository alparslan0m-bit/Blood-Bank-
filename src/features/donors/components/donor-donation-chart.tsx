import { useMemo } from "react";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import { CHART_TOOLTIP_STYLE } from "@/features/dashboard/constants/chart-styles";
import { groupChecksByMonth } from "@/features/donors/utils/donor-stats";
import { EmptyState } from "@/components/empty-state";
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

export function DonorDonationChart({ checks, loading }: DonorDonationChartProps) {
  const chartData = useMemo(
    () => groupChecksByMonth(checks ?? []),
    [checks],
  );
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
          <EmptyState
            className="py-md"
            icon={<EntityEmptyIcon entity="checks" className="h-5 w-5" />}
            title="No donation history"
            description="Monthly activity will appear once checks are linked."
          />
        )}
      </div>
    </DashboardPanel>
  );
}
