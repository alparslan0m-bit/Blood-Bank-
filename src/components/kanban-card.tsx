import { cn } from "@/lib/utils";

interface KanbanCardProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function KanbanCard({ onClick, className, children }: KanbanCardProps) {
  const sharedClassName = cn(
    "w-full rounded-sm border border-hairline bg-canvas p-sm text-left shadow-level-1 transition-colors",
    onClick &&
      "hover:border-hairline-strong hover:bg-canvas-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2",
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={sharedClassName}>
        {children}
      </button>
    );
  }

  return <div className={sharedClassName}>{children}</div>;
}
