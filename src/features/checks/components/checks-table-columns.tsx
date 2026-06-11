import { BloodTypeBadge } from "@/components/blood-type-badge";
import { StatusBadge } from "@/components/status-badge";
import type { Column } from "@/components/data-table";
import type { CheckWithRelations } from "@/types/database";
import { formatDate } from "@/lib/utils";

export function getChecksTableColumns(): Column<CheckWithRelations>[] {
  return [
    {
      key: "serial",
      header: "Serial",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-medium">{row.serial}</span>
      ),
    },
    {
      key: "donor",
      header: "Donor",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.donors?.full_name}</span>
          <span className="text-caption text-mute">Age: {row.donors?.age}</span>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      sortable: true,
      render: (row) =>
        row.patients ? (
          <div className="flex flex-col">
            <span className="font-medium">{row.patients.full_name}</span>
            <span className="text-caption text-mute">
              {row.patients.department}
            </span>
          </div>
        ) : (
          <span className="text-mute">—</span>
        ),
    },
    {
      key: "blood_type",
      header: "Blood Group",
      render: (row) =>
        row.blood_types ? (
          <BloodTypeBadge
            code={row.blood_types.code}
            isRare={row.blood_types.is_rare}
          />
        ) : (
          <span className="text-mute">Pending Lab</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      header: "Created Date",
      sortable: true,
      render: (row) => <span>{formatDate(row.created_at)}</span>,
    },
    {
      key: "distributor",
      header: "Distributor",
      render: (row) => (
        <span>
          {row.distributor?.full_name ?? <span className="text-mute">—</span>}
        </span>
      ),
    },
  ];
}
