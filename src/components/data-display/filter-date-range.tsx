interface FilterDateRangeProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function FilterDateRange({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: FilterDateRangeProps) {
  return (
    <>
      <div className="flex-1 w-full max-w-xs">
        <label className="text-caption font-mono uppercase tracking-wider text-mute mb-2 block">
          From Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full rounded border border-hairline bg-canvas px-3 py-2 text-body-sm"
        />
      </div>
      <div className="flex-1 w-full max-w-xs">
        <label className="text-caption font-mono uppercase tracking-wider text-mute mb-2 block">
          To Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full rounded border border-hairline bg-canvas px-3 py-2 text-body-sm"
        />
      </div>
    </>
  );
}
