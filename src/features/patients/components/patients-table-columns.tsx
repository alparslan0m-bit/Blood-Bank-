import type { Column } from "@/components/data-table";
import type { Patient } from "@/types/database";
import { formatDate } from "@/lib/utils";

export function getPatientsTableColumns(): Column<Patient>[] {
  return [
    {
      key: "full_name",
      header: "Patient Name",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.full_name}</span>
          <span className="text-caption text-mute">
            National ID: {row.national_id}
          </span>
        </div>
      ),
    },
    {
      key: "file_number",
      header: "Hospital File #",
      sortable: true,
      render: (row) => <span className="font-mono">{row.file_number}</span>,
    },
    {
      key: "department",
      header: "Medical Department",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-ink">{row.department}</span>
      ),
    },
    {
      key: "phone",
      header: "Contact Phone",
      render: (row) => <span>{row.phone}</span>,
    },
    {
      key: "created_at",
      header: "Registered Date",
      sortable: true,
      render: (row) => <span>{formatDate(row.created_at)}</span>,
    },
  ];
}
