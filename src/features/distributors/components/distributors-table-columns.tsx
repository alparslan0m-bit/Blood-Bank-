import { BloodTypeBadge } from "@/components/blood-type-badge";
import type { Column } from "@/components/data-table";
import { formatDate } from "@/lib/utils";

type DistributorPerformanceRow = {
  created_at: string;
  quantity?: number | null;
  distributor?: {
    full_name?: string;
    username?: string;
    phone?: string | null;
  };
  patient?: { full_name?: string; department?: string };
  blood_type?: { code: string; is_rare: boolean } | null;
  donation_check?: { serial?: string };
};

export function getDistributorsTableColumns(): Column<DistributorPerformanceRow>[] {
  return [
    {
      key: "distributor",
      header: "Distributor Staff",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.distributor?.full_name}</span>
          <span className="text-caption text-mute">
            @{row.distributor?.username}
          </span>
          {row.distributor?.phone ? (
            <span className="text-caption text-mute">
              {row.distributor.phone}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "patient",
      header: "Patient Served",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.patient?.full_name || "—"}</span>
          <span className="text-caption text-mute">
            {row.patient?.department || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "blood_type",
      header: "Blood Type",
      render: (row) =>
        row.blood_type ? (
          <BloodTypeBadge
            code={row.blood_type.code}
            isRare={row.blood_type.is_rare}
          />
        ) : (
          <span className="text-mute">—</span>
        ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => (
        <span>{row.quantity ? `${row.quantity} units` : "—"}</span>
      ),
    },
    {
      key: "donation_check",
      header: "Check Number",
      render: (row) => (
        <span className="font-mono text-body-sm">
          {row.donation_check?.serial || "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-mute">{formatDate(row.created_at)}</span>
      ),
    },
  ];
}
