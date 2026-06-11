import type { CheckWithRelations } from "@/types/database";

export function getBloodTestNotes(check: CheckWithRelations): string | null {
  const raw = check.metadata;
  if (!raw || typeof raw !== "object") return null;

  const notes =
    "blood_test_notes" in raw
      ? raw.blood_test_notes
      : "bloodTestNotes" in raw
        ? raw.bloodTestNotes
        : null;

  return typeof notes === "string" && notes.trim() ? notes.trim() : null;
}
