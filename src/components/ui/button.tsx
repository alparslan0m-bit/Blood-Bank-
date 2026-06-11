import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        outline:
          "bg-transparent border border-hairline hover:bg-canvas-soft text-body",
        default: "bg-primary text-on-primary hover:opacity-90",
        secondary:
          "bg-canvas text-ink border border-hairline hover:bg-canvas-soft",
        destructive: "bg-error text-white hover:bg-error-deep",
        ghost: "text-body hover:bg-canvas-soft-2 hover:text-ink",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-6 px-2 rounded-sm text-[11px]",
        default: "h-10 px-4 rounded-sm",
        sm: "h-8 px-3 rounded-sm text-caption",
        lg: "h-12 px-6 rounded-sm",
        icon: "h-8 w-8 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "ghost"
  | "link"
  | "outline"
  | null;
export type ButtonSize = "default" | "sm" | "lg" | "icon" | "xs" | null;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
