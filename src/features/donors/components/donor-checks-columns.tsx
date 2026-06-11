import { Link } from "react-router-dom";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { StatusBadge } from "@/components/status-badge";
import type { RecordsColumn } from "@/components/data-display/records-table";
import { formatDate } from "@/lib/utils";

export type DonorCheckRow = {
  id: string;
  serial: string;
  status: string;
  patient_id: string | null;
  created_at: string;
  patients?: { full_name: string } | null;
  blood_types?: { code: string; is_rare?: boolean } | null;
};

export function getDonorChecksColumns(): RecordsColumn<DonorCheckRow>[] {
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
      key: "patient",
      header: "Recipient Patient",
      render: (row) =>
        row.patients ? (
          <Link
            to={`/patients/${row.patient_id}`}
            className="font-medium text-ink hover:underline"
          >
            {row.patients.full_name}
          </Link>
        ) : (
          <span className="text-mute">Anonymous</span>
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
