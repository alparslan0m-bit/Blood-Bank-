import { useLifecycleCounts } from "@/features/dashboard/hooks/use-dashboard";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import { getStatusConfig } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";
import { CHART_AXIS_TICK, CHART_TOOLTIP_STYLE } from "@/features/dashboard/constants/chart-styles";

const STAGE_COLORS = [
  "var(--color-coral)",
  "var(--color-indigo)",
  "var(--color-teal)",
  "var(--color-violet)",
];

export function CheckLifecycleFunnel() {
  const { data: counts, isLoading } = useLifecycleCounts();
  const chartData =
    counts?.map((item, index) => ({
      ...item,
      label: getStatusConfig(item.status).label,
      fill: STAGE_COLORS[index] ?? STAGE_COLORS[0],
    })) ?? [];

  return (
    <DashboardPanel
      title="Check lifecycle funnel"
      description="Volume at each stage — bottlenecks show as wider bars upstream"
      loading={isLoading}
    >
      <div className="h-[280px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <XAxis type="number" tick={CHART_AXIS_TICK} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                width={120}
                tick={CHART_AXIS_TICK}
              />
              <RechartsTooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value: number) => [value, "Checks"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="flex h-full items-center justify-center text-body-sm text-mute">
            No lifecycle data available
          </p>
        )}
      </div>
    </DashboardPanel>
  );
}
