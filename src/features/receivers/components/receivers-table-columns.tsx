import { Badge } from "@/components/ui/badge";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import type { Column } from "@/components/data-table";
import { formatDate } from "@/lib/utils";

type ReceiverPerformanceRow = {
  created_at: string;
  receiver?: { full_name?: string; username?: string; phone?: string | null };
  donor?: { full_name?: string; national_id?: string };
  blood_type?: { code: string; is_rare: boolean } | null;
  donation_check?: { serial?: string };
};

export function getReceiversTableColumns(): Column<ReceiverPerformanceRow>[] {
  return [
    {
      key: "receiver",
      header: "Receiver Staff",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.receiver?.full_name}</span>
          <span className="text-caption text-mute">
            @{row.receiver?.username}
          </span>
          {row.receiver?.phone ? (
            <span className="text-caption text-mute">{row.receiver.phone}</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "donor",
      header: "Donor Registered",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.donor?.full_name}</span>
          <span className="text-caption text-mute">
            ID: {row.donor?.national_id}
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
