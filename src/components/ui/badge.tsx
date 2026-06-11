import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        secondary: "bg-canvas text-ink border border-hairline",
        destructive: "bg-error-soft text-error-deep",
        default: "bg-canvas-soft-2 text-body",
        success: "bg-link-bg-soft text-link",
        warning: "bg-warning-soft text-warning-deep",
        error: "bg-error-soft text-error-deep",
        violet: "bg-violet-soft text-violet",
        cyan: "bg-cyan-soft text-cyan",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "violet"
  | "cyan"
  | "secondary"
  | "destructive"
  | null;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
