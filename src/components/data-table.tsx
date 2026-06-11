import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  ChecksTableSkeletonBody,
  DonorsTableSkeletonBody,
} from "@/components/data-table-skeletons";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRowClick?: (row: T) => void;
  getRowKey?: (row: T, index: number) => string;
  getRowClassName?: (row: T) => string | undefined;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  loadingSkeleton?: "checks" | "donors" | "default";
}

export function DataTable<T>({
  columns,
  data,
  loading,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  onRowClick,
  getRowKey,
  getRowClassName,
  pageSize = 15,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyIcon,
  emptyAction,
  loadingSkeleton = "default",
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [data.length, searchValue]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  if (loading) {
    return (
      <div
        className="rounded-md border border-hairline bg-canvas shadow-level-2"
        aria-busy="true"
        aria-label="Loading table"
      >
        {onSearchChange && (
          <div className="border-b border-hairline p-md">
            <Skeleton className="h-10 w-64" />
          </div>
        )}
        {loadingSkeleton === "default" ? (
          <div className="space-y-3 p-md">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="bg-canvas-soft px-md py-xs text-left"
                    >
                      <Skeleton className="h-3 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingSkeleton === "checks" ? (
                  <ChecksTableSkeletonBody />
                ) : (
                  <DonorsTableSkeletonBody />
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  const rangeStart = sorted.length === 0 ? 0 : page * pageSize + 1;
  const rangeEnd = Math.min((page + 1) * pageSize, sorted.length);

  return (
    <div className="rounded-md border border-hairline bg-canvas shadow-level-2">
      {onSearchChange && (
        <div className="border-b border-hairline p-md">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
              aria-hidden
            />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              aria-label={searchPlaceholder}
            />
          </div>
        </div>
      )}

      {paged.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={
                        col.sortable && sortKey === col.key
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : col.sortable
                            ? "none"
                            : undefined
                      }
                      className={cn(
                        "bg-canvas-soft px-md py-xs text-left text-caption font-mono uppercase tracking-wide text-mute",
                        col.sortable &&
                          "cursor-pointer select-none hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-1",
                        col.className,
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                      onKeyDown={(e) => {
                        if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          handleSort(col.key);
                        }
                      }}
                      tabIndex={col.sortable ? 0 : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.sortable && sortKey === col.key && (
                          <span className="text-ink" aria-hidden>
                            {sortDir === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr
                    key={getRowKey?.(row, page * pageSize + i) ?? page * pageSize + i}
                    className={cn(
                      "border-b border-hairline transition-colors last:border-0",
                      onRowClick &&
                        "cursor-pointer hover:bg-canvas-soft focus-within:bg-canvas-soft",
                      getRowClassName?.(row),
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-md py-sm text-body-sm text-ink",
                          col.className,
                        )}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-hairline px-md py-sm">
            <span className="text-caption tabular-nums text-mute">
              {sorted.length === 0
                ? "0 results"
                : totalPages > 1
                  ? `${rangeStart}–${rangeEnd} of ${sorted.length.toLocaleString()}`
                  : `${sorted.length.toLocaleString()} result${sorted.length === 1 ? "" : "s"}`}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
