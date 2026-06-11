import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildBreadcrumbSegments,
  canNavigateBack,
} from "@/lib/breadcrumb";

interface DetailBreadcrumbProps {
  /** Fallback route when browser history is unavailable */
  backTo: string;
  /** Display label for the current page (replaces the URL id segment) */
  currentLabel: string;
}

export function DetailBreadcrumb({
  backTo,
  currentLabel,
}: DetailBreadcrumbProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = buildBreadcrumbSegments(location.pathname, currentLabel);

  const handleBack = () => {
    if (canNavigateBack()) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-sm min-w-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={handleBack}
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <ol className="flex min-w-0 flex-wrap items-center gap-xxs text-caption font-mono text-mute">
        {segments.map((segment, index) => (
          <li key={`${segment.label}-${index}`} className="flex items-center gap-xxs">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-mute/60" aria-hidden />
            )}
            {segment.current ? (
              <span className="truncate text-ink" aria-current="page">
                {segment.label}
              </span>
            ) : (
              <Link
                to={segment.to!}
                className="truncate text-mute transition-colors hover:text-ink"
              >
                {segment.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
