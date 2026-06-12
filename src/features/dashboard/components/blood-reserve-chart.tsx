import { useBloodTypeDistribution } from "@/features/dashboard/hooks/use-dashboard";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import { CHART_TOOLTIP_STYLE } from "@/features/dashboard/constants/chart-styles";
import { CHART_COLORS } from "@/constants/chart-colors";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";

export function BloodReserveChart() {
  const { data: bloodDistribution, isLoading } = useBloodTypeDistribution();
  const hasData = bloodDistribution && bloodDistribution.length > 0;
  const totalDonors =
    bloodDistribution?.reduce((acc, curr) => acc + curr.value, 0) ?? 0;

  return (
    <DashboardPanel
      title="Blood reserve share"
      description="Donor distribution by blood group"
      loading={isLoading}
    >
      <div className="relative flex h-[220px] items-center justify-center">
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bloodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {bloodDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              aria-hidden
            >
              <span className="text-display-sm font-semibold tabular-nums text-ink">
                {totalDonors.toLocaleString()}
              </span>
              <span className="text-caption text-mute">Total donors</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-lg text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-soft-2 mb-4">
              <EntityEmptyIcon entity="blood" />
            </div>
            <h3 className="text-body-sm font-medium text-ink mb-1">
              No blood type data
            </h3>
            <p className="text-caption text-mute max-w-sm">
              Donor blood groups will populate this chart.
            </p>
          </div>
        )}
      </div>

      {hasData && (
        <ul className="mt-md grid grid-cols-4 gap-xxs">
          {bloodDistribution.slice(0, 8).map((entry, index) => (
            <li
              key={entry.name}
              className="flex flex-col items-center rounded-sm bg-canvas-soft p-xxs"
            >
              <span className="text-caption font-semibold text-ink">
                {entry.name}
              </span>
              <span className="text-[10px] tabular-nums text-mute">
                {entry.value.toLocaleString()}
              </span>
              <span
                className="mt-1 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
