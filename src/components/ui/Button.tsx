import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "admin";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-500 dark:to-cyan-400 text-white hover:from-blue-700 hover:to-cyan-600 dark:hover:from-blue-600 dark:hover:to-cyan-500 focus:ring-blue-500 shadow-lg hover:shadow-xl hover:scale-105",
      secondary:
        "bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 text-white hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 focus:ring-slate-500",
      outline:
        "border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white focus:ring-blue-500",
      ghost:
        "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500",
      admin:
        "bg-gray-700 dark:bg-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-500 focus:ring-gray-500 shadow-sm",
    };

    const getSizeClasses = () => {
      if (variant === "admin") {
        switch (size) {
          case "sm":
            return "px-2.5 py-1.5 text-xs";
          case "md":
            return "px-3 py-2 text-sm";
          case "lg":
            return "px-4 py-2.5 text-sm";
          default:
            return "px-3 py-2 text-sm";
        }
      }
      switch (size) {
        case "sm":
          return "px-3 py-2 text-sm";
        case "md":
          return "px-6 py-3 text-base";
        case "lg":
          return "px-8 py-4 text-lg";
        default:
          return "px-6 py-3 text-base";
      }
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], getSizeClasses(), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
