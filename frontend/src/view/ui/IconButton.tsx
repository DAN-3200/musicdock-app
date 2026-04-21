import { forwardRef } from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   label: string;
   variant?: "secondary" | "primary";
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(
   ({ label, variant = "secondary", className = "", children, ...rest }, ref) => {
      const styles =
         variant === "primary"
            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300"
            : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800";
      return (
         <button
            ref={ref}
            type="button"
            aria-label={label}
            className={`inline-flex items-center justify-center w-9 h-9 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 active:scale-95 ${styles} ${className}`}
            {...rest}
         >
            {children}
         </button>
      );
   }
);
IconButton.displayName = "IconButton";