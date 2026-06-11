import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotFoundStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
}

export function NotFoundState({
  icon: Icon,
  title,
  description,
  backTo,
  backLabel,
}: NotFoundStateProps) {
  return (
    <div className="mx-auto flex h-[400px] max-w-md flex-col items-center justify-center text-center">
      <Icon className="mb-4 h-12 w-12 text-error" aria-hidden />
      <h3 className="text-body-md font-semibold text-ink">{title}</h3>
      <p className="mb-lg mt-2 text-caption text-mute">{description}</p>
      <Link to={backTo}>
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
      </Link>
    </div>
  );
}
