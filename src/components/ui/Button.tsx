import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "md" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  const base =
    "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

  const variantStyles: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
    outline: "border border-border bg-background hover:bg-muted hover:text-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-muted hover:text-foreground",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/30",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizeStyles: Record<string, string> = {
    default: "h-9 text-sm gap-1.5 px-3.5",
    xs: "h-6 text-xs gap-1 px-2 [&_svg:not([class*='size-'])]:size-3",
    sm: "h-8 text-xs gap-1.5 px-3",
    md: "h-9 text-sm gap-1.5 px-3.5",
    lg: "h-10 text-base gap-2 px-5",
    icon: "size-9 p-0",
    "icon-xs": "size-6 p-0 [&_svg:not([class*='size-'])]:size-3",
    "icon-sm": "size-8 p-0",
    "icon-lg": "size-10 p-0",
  };

  return cn(base, variantStyles[variant] || variantStyles.default, sizeStyles[size] || sizeStyles.default, className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";