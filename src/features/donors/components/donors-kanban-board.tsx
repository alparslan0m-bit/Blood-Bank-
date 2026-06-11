import { useNavigate } from "react-router-dom";
import { BloodTypeBadge } from "@/components/blood-type-badge";
import { KanbanBoard } from "@/components/kanban-board";
import { KanbanCard } from "@/components/kanban-card";
import { DONOR_KANBAN_COLUMNS } from "@/features/donors/constants/donor-kanban-columns";
import {
  getDaysSinceLastDonation,
  getDonorStatus,
} from "@/features/donors/utils/donor-stats";
import type { DonorWithBloodType } from "@/types/database";

interface DonorsKanbanBoardProps {
  donors: DonorWithBloodType[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

export function DonorsKanbanBoard({
  donors,
  loading,
  search,
  onSearchChange,
  emptyTitle,
  emptyDescription,
  emptyIcon,
}: DonorsKanbanBoardProps) {
  const navigate = useNavigate();

  return (
    <KanbanBoard
      columns={DONOR_KANBAN_COLUMNS}
      items={donors}
      groupBy={(donor) => getDonorStatus(donor.last_donation_date)}
      getItemKey={(donor) => donor.id}
      onItemClick={(donor) => navigate(`/donors/${donor.id}`)}
      loading={loading}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name, phone, or national ID..."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyColumnLabel="No donors"
      renderCard={(donor, { onClick }) => {
        const daysSince = getDaysSinceLastDonation(donor.last_donation_date);

        return (
          <KanbanCard onClick={onClick}>
            <p className="truncate font-medium text-body-sm text-ink">
              {donor.full_name}
            </p>
            <p className="mt-xxs truncate text-caption text-mute">
              {donor.national_id}
            </p>
            <div className="mt-sm flex items-center justify-between gap-xs">
              {donor.blood_types ? (
                <BloodTypeBadge
                  code={donor.blood_types.code}
                  isRare={donor.blood_types.is_rare}
                />
              ) : (
                <span className="text-caption text-mute">Unrecorded</span>
              )}
              <span className="shrink-0 text-[10px] font-mono text-mute">
                {donor.total_donations} donations
              </span>
            </div>
            <p className="mt-xxs text-[10px] font-mono text-mute">
              {daysSince !== null
                ? `${daysSince}d since last`
                : "Never donated"}
            </p>
          </KanbanCard>
        );
      }}
    />
  );
}
