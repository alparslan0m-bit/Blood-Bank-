import { formatDateTime } from "@/lib/utils";
import type { CheckWithRelations, User } from "@/types/database";

interface CheckChainOfCustodyProps {
  check: CheckWithRelations;
}

interface CustodyRow {
  stage: string;
  actor: string;
  role: string;
  timestamp: string | null;
  device: string;
}

function userLabel(user: User | null | undefined): string {
  return user?.full_name ?? user?.username ?? "—";
}

export function CheckChainOfCustody({ check }: CheckChainOfCustodyProps) {
  const rows: CustodyRow[] = [
    {
      stage: "Created",
      actor: userLabel(check.created_by_user),
      role: "Receiver",
      timestamp: check.created_at,
      device: "—",
    },
    {
      stage: "Transferred",
      actor: userLabel(check.created_by_user),
      role: "Receiver",
      timestamp: check.transferred_to_distributor_at,
      device: "—",
    },
    {
      stage: "Blood Recorded",
      actor: userLabel(check.blood_recorder),
      role: "Lab",
      timestamp: check.blood_recorded_at,
      device: "Web",
    },
    {
      stage: "Patient Served",
      actor: userLabel(check.patient_server),
      role: "Distributor",
      timestamp: check.patient_served_at,
      device: "—",
    },
  ];

  return (
    <div className="rounded-md bg-canvas shadow-level-2 p-lg border border-hairline">
      <h3 className="text-body-sm font-mono uppercase tracking-wider text-mute mb-md">
        Chain of Custody
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-caption font-mono uppercase tracking-wider text-mute">
              <th className="pb-sm pr-md font-medium">Stage</th>
              <th className="pb-sm pr-md font-medium">Actor</th>
              <th className="pb-sm pr-md font-medium">Role</th>
              <th className="pb-sm pr-md font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.stage} className="border-b border-hairline last:border-0">
                <td className="py-sm pr-md font-medium text-ink">{row.stage}</td>
                <td className="py-sm pr-md text-body">{row.actor}</td>
                <td className="py-sm pr-md text-mute">{row.role}</td>
                <td className="py-sm pr-md font-mono text-caption text-mute">
                  {row.timestamp ? formatDateTime(row.timestamp) : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
