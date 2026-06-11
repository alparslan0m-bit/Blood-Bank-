import { Quote } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface DonorNotesCardProps {
  notes: string;
  updatedAt: string;
}

export function DonorNotesCard({ notes, updatedAt }: DonorNotesCardProps) {
  return (
    <div className="border-t border-hairline pt-md">
      <p className="mb-sm text-[10px] font-mono uppercase tracking-wider text-mute">
        Staff notes
      </p>
      <blockquote className="relative rounded-sm border border-hairline border-l-4 border-l-indigo bg-canvas-soft px-md py-sm">
        <Quote
          className="absolute right-sm top-sm h-4 w-4 text-indigo/20"
          aria-hidden
        />
        <p className="text-body-sm leading-relaxed text-body whitespace-pre-wrap pr-lg">
          {notes}
        </p>
      </blockquote>
      <p className="mt-xs text-caption text-mute">
        Last updated {formatDateTime(updatedAt)}
      </p>
    </div>
  );
}
