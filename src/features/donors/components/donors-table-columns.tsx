import { BloodTypeBadge } from "@/components/blood-type-badge";
import type { Column } from "@/components/data-table";
import type { DonorWithBloodType } from "@/types/database";
import { formatDate } from "@/lib/utils";

export function getDonorsTableColumns(): Column<DonorWithBloodType>[] {
  return [
    {
      key: "full_name",
      header: "Donor Name",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.full_name}</span>
          <span className="text-caption text-mute">ID: {row.national_id}</span>
        </div>
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
          <span className="text-mute">Unrecorded</span>
        ),
    },
    {
      key: "phone",
      header: "Contact Phone",
      render: (row) => <span>{row.phone}</span>,
    },
    {
      key: "age",
      header: "Age / Gender",
      sortable: true,
      render: (row) => (
        <span>
          {row.age} yrs · {row.gender}
        </span>
      ),
    },
    {
      key: "total_donations",
      header: "Total Donations",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-xs">
          <span className="font-semibold text-ink">{row.total_donations}</span>
          <span className="text-[10px] text-mute">times</span>
        </div>
      ),
    },
    {
      key: "last_donation_date",
      header: "Last Donation",
      sortable: true,
      render: (row) => (
        <span>
          {row.last_donation_date ? (
            formatDate(row.last_donation_date)
          ) : (
            <span className="text-mute">Never</span>
          )}
        </span>
      ),
    },
  ];
}
