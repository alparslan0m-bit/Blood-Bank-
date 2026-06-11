import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  children: React.ReactNode;
  showReset?: boolean;
  onReset?: () => void;
}

export function FilterBar({ children, showReset, onReset }: FilterBarProps) {
  return (
    <div
      role="search"
      aria-label="Table filters"
      className="flex flex-col sm:flex-row gap-md items-end sm:items-center bg-canvas p-md rounded-md border border-hairline shadow-level-1"
    >
      {children}
      {showReset && onReset && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-caption flex items-center gap-xxs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
