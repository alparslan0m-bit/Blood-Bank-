import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-hairline pb-md",
        className,
      )}
    >
      <div>
        <h1 className="text-display-md font-semibold text-ink tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-body-sm text-body mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
