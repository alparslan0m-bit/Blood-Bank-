import { useDepartmentDistribution } from "@/features/dashboard/hooks/use-dashboard";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
} from "@/features/dashboard/constants/chart-styles";
import { CHART_COLORS } from "@/constants/chart-colors";
import { EmptyState } from "@/components/empty-state";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";

export function DepartmentsChart() {
  const { data: deptDistribution, isLoading } = useDepartmentDistribution();
  const hasData = deptDistribution && deptDistribution.length > 0;

  return (
    <DashboardPanel
      title="Departments served"
      description="Patients assisted by medical department"
      loading={isLoading}
    >
      <div className="h-[220px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={deptDistribution}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="name" {...CHART_AXIS_TICK} fontSize={10} />
              <YAxis {...CHART_AXIS_TICK} fontSize={10} allowDecimals={false} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" name="Patients" radius={[4, 4, 0, 0]}>
                {deptDistribution.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            className="py-lg"
            icon={<EntityEmptyIcon entity="department" />}
            title="No department data"
            description="Patient registrations will appear by department."
          />
        )}
      </div>
    </DashboardPanel>
  );
}
