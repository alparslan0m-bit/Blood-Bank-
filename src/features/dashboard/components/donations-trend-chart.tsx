import { useDonationsPerMonth } from "@/features/dashboard/hooks/use-dashboard";
import { DashboardPanel } from "@/features/dashboard/components/dashboard-panel";
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_STYLE,
} from "@/features/dashboard/constants/chart-styles";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

export function DonationsTrendChart() {
  const { data: monthlyTrend, isLoading } = useDonationsPerMonth();
  const hasData = monthlyTrend && monthlyTrend.length > 0;

  return (
    <DashboardPanel
      title="Donations trend"
      description="Monthly donation volume across all checks"
      loading={isLoading}
      action={
        hasData ? (
          <span className="inline-flex items-center gap-xxs rounded-sm bg-canvas-soft px-sm py-xxs text-caption font-mono text-body">
            <TrendingUp className="h-3.5 w-3.5 text-link" aria-hidden />
            {monthlyTrend.length} periods
          </span>
        ) : null
      }
    >
      <div className="h-[280px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyTrend}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-link)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-link)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" {...CHART_AXIS_TICK} />
              <YAxis {...CHART_AXIS_TICK} allowDecimals={false} width={32} />
              <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="count"
                name="Donations"
                stroke="var(--color-link)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTrend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-soft-2 mb-4">
              <EntityEmptyIcon entity="checks" />
            </div>
            <h3 className="text-body-sm font-medium text-ink mb-1">
              No trend data yet
            </h3>
            <p className="text-caption text-mute max-w-sm">
              Donation checks will appear here as they are recorded.
            </p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}
