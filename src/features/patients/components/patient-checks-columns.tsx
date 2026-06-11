import { Link } from "react-router-dom";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { StatusBadge } from "@/components/status-badge";
import type { RecordsColumn } from "@/components/data-display/records-table";
import { formatDate } from "@/lib/utils";

export type PatientCheckRow = {
  id: string;
  serial: string;
  status: string;
  donor_id: string;
  created_at: string;
  donors?: { full_name: string } | null;
  blood_types?: { code: string; is_rare?: boolean } | null;
};

export function getPatientChecksColumns(): RecordsColumn<PatientCheckRow>[] {
  return [
    {
      key: "serial",
      header: "Serial",
      render: (row) => (
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
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "donor",
      header: "Donor",
      render: (row) =>
        row.donors ? (
          <Link
            to={`/donors/${row.donor_id}`}
            className="font-medium text-ink hover:underline"
          >
            {row.donors.full_name}
          </Link>
        ) : (
          <span className="text-mute">Unknown</span>
        ),
    },
    {
      key: "blood_type",
      header: "Blood Type",
      render: (row) =>
        row.blood_types ? (
          <BloodTypeBadge
            code={row.blood_types.code}
            isRare={row.blood_types.is_rare}
          />
        ) : (
          <span className="text-mute">Pending</span>
        ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (row) => (
        <span className="text-caption text-mute">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];
}
