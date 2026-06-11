import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export interface RecordsColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface RecordsTableProps<T> {
  columns: RecordsColumn<T>[];
  data: T[];
  loading?: boolean;
  getRowKey: (row: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
}

export function RecordsTable<T>({
  columns,
  data,
  loading,
  getRowKey,
  emptyTitle,
  emptyDescription,
}: RecordsTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-lg" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin text-mute" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        className="py-xl"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-hairline bg-canvas-soft text-caption font-mono uppercase tracking-wider text-mute">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("px-md py-xs text-left", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-hairline transition-colors last:border-0 hover:bg-canvas-soft"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-md py-sm text-body-sm", col.className)}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
