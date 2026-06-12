import { Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

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
  emptyIcon?: React.ReactNode;
}

export function RecordsTable<T>({
  columns,
  data,
  loading,
  getRowKey,
  emptyTitle,
  emptyDescription,
  emptyIcon,
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
      <div className="flex flex-col items-center justify-center py-xl text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-soft-2 mb-4">
          {emptyIcon ?? <Inbox className="h-6 w-6 text-mute" />}
        </div>
        <h3 className="text-body-sm font-medium text-ink mb-1">{emptyTitle}</h3>
        {emptyDescription && (
          <p className="text-caption text-mute max-w-sm">{emptyDescription}</p>
        )}
      </div>
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
