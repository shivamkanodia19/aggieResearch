import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-maroon-900 text-white hover:bg-maroon-700 focus-visible:ring-maroon-900",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400",
        outline:
          "border-2 border-maroon-900 text-maroon-900 hover:bg-maroon-50 focus-visible:ring-maroon-900",
        ghost: "hover:bg-maroon-100 text-gray-700 focus-visible:ring-maroon-900",
        link: "text-maroon-900 underline-offset-4 hover:underline",
        success: "bg-pipeline-success text-white hover:bg-emerald-700 focus-visible:ring-pipeline-success",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
