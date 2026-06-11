import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className = "h-[400px]",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-mute mb-2" />
      <span className="text-body-sm text-mute">{message}</span>
    </div>
  );
}
