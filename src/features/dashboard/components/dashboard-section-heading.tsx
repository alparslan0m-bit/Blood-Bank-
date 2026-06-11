interface DashboardSectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
}

export function DashboardSectionHeading({
  id,
  title,
  description,
}: DashboardSectionHeadingProps) {
  return (
    <div className="mb-md">
      <h2
        id={id}
        className="text-caption font-mono uppercase tracking-wider text-mute"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-body-sm text-body">{description}</p>
      )}
    </div>
  );
}
