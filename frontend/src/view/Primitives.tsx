import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
    {children}
  </span>
);

export const IconButton = ({
  onClick,
  ariaLabel,
  active,
  size = "md",
  children,
}: {
  onClick?: () => void;
  ariaLabel: string;
  active?: boolean;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) => {
  const dim =
    size === "lg" ? "w-10 h-10" : size === "sm" ? "w-6 h-6" : "w-8 h-8";
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`${dim} grid place-items-center rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-foreground ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </motion.button>
  );
};

export const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 transition-colors rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground ${
      checked ? "bg-foreground" : "bg-border"
    }`}
  >
    <motion.span
      className="absolute top-0.5 left-0.5 w-4 h-4 rounded-sm bg-background"
      animate={{ x: checked ? 16 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);
