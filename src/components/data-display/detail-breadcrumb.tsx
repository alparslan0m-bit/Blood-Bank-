import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailBreadcrumbProps {
  backTo: string;
  trail: string;
}

export function DetailBreadcrumb({ backTo, trail }: DetailBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-xs">
      <Link to={backTo}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <span className="text-caption font-mono text-mute">{trail}</span>
    </nav>
  );
}
