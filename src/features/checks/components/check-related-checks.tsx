import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList } from "lucide-react";
import { useDonorChecks } from "@/features/donors/hooks/use-donors";
import { StatusBadge } from "@/components/status-badge";
import { RecordsTable } from "@/components/data-display";
import { EntityEmptyIcon } from "@/constants/empty-state-icons";
import { formatDate } from "@/lib/utils";
import type { DonorCheckRow } from "@/features/donors/components/donor-checks-columns";

interface CheckRelatedChecksProps {
  donorId: string;
  currentCheckId: string;
}

export function CheckRelatedChecks({
  donorId,
  currentCheckId,
}: CheckRelatedChecksProps) {
  const { data: checks, isLoading } = useDonorChecks(donorId);

  const relatedChecks = (checks ?? [])
    .filter((check) => check.id !== currentCheckId)
    .slice(0, 3);

  const columns = [
    {
      key: "serial",
      header: "Serial",
      render: (row: DonorCheckRow) => (
        <Link
          to={`/checks/${row.id}`}
          className="font-mono text-link hover:underline"
        >
          {row.serial}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: DonorCheckRow) => <StatusBadge status={row.status} />,
    },
    {
      key: "created",
      header: "Created",
      className: "text-right",
      render: (row: DonorCheckRow) => (
        <span className="text-mute font-mono text-caption">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
      <h3 className="text-body-md font-semibold text-ink mb-lg border-b border-hairline pb-sm flex items-center gap-sm">
        <ClipboardList className="h-5 w-5 text-mute" />
        Related Checks
      </h3>

      <RecordsTable
        columns={columns}
        data={relatedChecks}
        loading={isLoading}
        getRowKey={(row) => row.id}
        emptyTitle="No other checks"
        emptyDescription="This donor has no additional donation checks on record."
        emptyIcon={<EntityEmptyIcon entity="checks" />}
      />

      <Link
        to={`/donors/${donorId}`}
        className="mt-md inline-flex items-center gap-xs text-body-sm text-link hover:underline"
      >
        View all from this donor
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
