import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { KanbanBoard, buildKanbanColumns } from "@/components/kanban-board";
import { KanbanCard } from "@/components/kanban-card";
import { formatRelative } from "@/lib/utils";
import type { Patient } from "@/types/database";

interface PatientsKanbanBoardProps {
  patients: Patient[];
  loading?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
}

export function PatientsKanbanBoard({
  patients,
  loading,
  search,
  onSearchChange,
  emptyTitle,
  emptyDescription,
  emptyIcon,
}: PatientsKanbanBoardProps) {
  const navigate = useNavigate();

  const columns = useMemo(
    () => buildKanbanColumns(patients.map((patient) => patient.department)),
    [patients],
  );

  return (
    <KanbanBoard
      columns={columns}
      items={patients}
      groupBy={(patient) => patient.department}
      getItemKey={(patient) => patient.id}
      onItemClick={(patient) => navigate(`/patients/${patient.id}`)}
      loading={loading}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name, file number, phone, or department..."
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyIcon={emptyIcon}
      emptyColumnLabel="No patients"
      renderCard={(patient, { onClick }) => (
        <KanbanCard onClick={onClick}>
          <p className="truncate font-medium text-body-sm text-ink">
            {patient.full_name}
          </p>
          <p className="mt-xxs truncate font-mono text-caption text-mute">
            {patient.file_number}
          </p>
          <div className="mt-sm flex items-center justify-between gap-xs">
            <span className="truncate text-caption text-body">{patient.phone}</span>
            <span className="shrink-0 text-[10px] font-mono text-mute">
              {formatRelative(patient.created_at)}
            </span>
          </div>
        </KanbanCard>
      )}
    />
  );
}
