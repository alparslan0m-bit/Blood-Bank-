interface DetailFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "critical";
}

export function DetailField({
  label,
  children,
  className,
  variant = "default",
}: DetailFieldProps) {
  return (
    <div className={className}>
      <span
        className={
          variant === "critical"
            ? "text-[10px] font-mono uppercase font-semibold text-error"
            : "text-[10px] font-mono uppercase text-mute"
        }
      >
        {label}
      </span>
      <div className="mt-0.5 text-body-sm font-medium text-ink">{children}</div>
    </div>
  );
}
