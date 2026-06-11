import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  icon: Icon,
  children,
  className,
}: DetailSectionProps) {
  return (
    <section
      className={cn(
        "rounded-md border border-hairline bg-canvas p-lg shadow-level-2",
        className,
      )}
    >
      <h3 className="mb-lg flex items-center gap-sm border-b border-hairline pb-sm text-body-md font-semibold text-ink">
        {Icon && <Icon className="h-5 w-5 text-mute" aria-hidden />}
        {title}
      </h3>
      {children}
    </section>
  );
}
