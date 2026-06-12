import { useMemo } from "react";
import { Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KanbanColumnDef {
  key: string;
  label: string;
  badgeClassName?: string;
}

export function buildKanbanColumns(keys: string[]): KanbanColumnDef[] {
  return [...new Set(keys)]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      key,
      label: key,
    }));
}

export function groupItemsByColumn<T>(
  items: T[],
  columns: KanbanColumnDef[],
  groupBy: (item: T) => string,
): Record<string, T[]> {
  const groups = Object.fromEntries(
    columns.map((column) => [column.key, [] as T[]]),
  ) as Record<string, T[]>;

  for (const item of items) {
    const key = groupBy(item);
    if (groups[key]) {
      groups[key].push(item);
    }
  }

  return groups;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumnDef[];
  items: T[];
  groupBy: (item: T) => string;
  getItemKey: (item: T) => string;
  renderCard: (
    item: T,
    ctx: { onClick?: () => void; className?: string },
  ) => React.ReactNode;
  onItemClick?: (item: T) => void;
  getCardClassName?: (item: T) => string | undefined;
  loading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  showSearch?: boolean;
  emptyColumnLabel?: string;
  skeletonColumnCount?: number;
}

export function KanbanBoard<T>({
  columns,
  items,
  groupBy,
  getItemKey,
  renderCard,
  onItemClick,
  getCardClassName,
  loading,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  emptyTitle = "No items match your criteria",
  emptyDescription = "Update your search or adjust the filters.",
  emptyIcon,
  emptyAction,
  showSearch = true,
  emptyColumnLabel = "No items",
  skeletonColumnCount = 4,
}: KanbanBoardProps<T>) {
  const grouped = useMemo(
    () => groupItemsByColumn(items, columns, groupBy),
    [items, columns, groupBy],
  );

  if (loading) {
    return (
      <div className="space-y-md">
        {showSearch && <Skeleton className="h-10 w-full max-w-sm" />}
        <div className="flex gap-md overflow-x-auto pb-sm">
          {Array.from({
            length: Math.max(columns.length, skeletonColumnCount),
          }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-[220px] flex-1 flex-col gap-sm"
            >
              <Skeleton className="h-8 w-full rounded-sm" />
              <Skeleton className="h-24 w-full rounded-sm" />
              <Skeleton className="h-24 w-full rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {showSearch && onSearchChange && (
        <div className="relative max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
            aria-hidden
          />
          <Input
            placeholder={searchPlaceholder}
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      {items.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-5xl text-center",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-soft-2 mb-4">
            {emptyIcon ?? <Inbox className="h-6 w-6 text-mute" />}
          </div>
          <h3 className="text-body-sm font-medium text-ink mb-1">
            {emptyTitle}
          </h3>
          {emptyDescription && (
            <p className="text-caption text-mute max-w-sm">
              {emptyDescription}
            </p>
          )}
          {emptyAction && <div className="mt-4">{emptyAction}</div>}
        </div>
      ) : (
        <div className="flex gap-md overflow-x-auto pb-sm -mx-px">
          {columns.map((column) => {
            const columnItems = grouped[column.key] ?? [];

            return (
              <section
                key={column.key}
                className="flex min-w-[220px] flex-1 flex-col rounded-md border border-hairline bg-canvas-soft"
                aria-label={`${column.label} column`}
              >
                <header className="flex items-center justify-between gap-sm border-b border-hairline px-sm py-sm">
                  <h3 className="truncate text-caption font-mono uppercase tracking-wider text-ink">
                    {column.label}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={cn(column.badgeClassName)}
                  >
                    {columnItems.length}
                  </Badge>
                </header>

                <ul className="flex max-h-[calc(100vh-20rem)] min-h-[120px] flex-col gap-sm overflow-y-auto p-sm">
                  {columnItems.length === 0 ? (
                    <li className="py-md text-center text-caption text-mute">
                      {emptyColumnLabel}
                    </li>
                  ) : (
                    columnItems.map((item) => (
                      <li key={getItemKey(item)}>
                        {renderCard(item, {
                          onClick: onItemClick
                            ? () => onItemClick(item)
                            : undefined,
                          className: getCardClassName?.(item),
                        })}
                      </li>
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
