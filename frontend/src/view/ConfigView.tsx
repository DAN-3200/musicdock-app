import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { SectionLabel } from "./ui/SectionLabel";
import { useMusic } from "../logic/useMusic";

const Toggle = ({
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
    className={`relative w-9 h-5 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 ${checked ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-300 dark:bg-zinc-700"
      }`}
  >
    <motion.span
      className="absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-zinc-900"
      animate={{ x: checked ? 16 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </button>
);

export const ConfigView = () => {
  const { settings, setSettings } = useMusic();

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <SectionLabel>Preferences</SectionLabel>
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between text-[12px] text-zinc-700 dark:text-zinc-300">
            <span>Shuffle</span>
            <Toggle
              checked={settings.shuffle}
              onChange={(v) => setSettings({ shuffle: v })}
              label="Shuffle"
            />
          </label>
          <label className="flex items-center justify-between text-[12px] text-zinc-700 dark:text-zinc-300">
            <span>Crossfade</span>
            <Toggle
              checked={settings.crossfade}
              onChange={(v) => setSettings({ crossfade: v })}
              label="Crossfade"
            />
          </label>
          <label className="flex items-center justify-between text-[12px] text-zinc-700 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1.5">
              <motion.span
                key={settings.dark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="inline-flex"
              >
                {settings.dark ? (
                  <Moon className="w-3.5 h-3.5" strokeWidth={2} />
                ) : (
                  <Sun className="w-3.5 h-3.5" strokeWidth={2} />
                )}
              </motion.span>
              Dark mode
            </span>
            <Toggle
              checked={settings.dark}
              onChange={(v) => setSettings({ dark: v })}
              label="Dark mode"
            />
          </label>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
          Music · Atomic UI Kit
        </p>

        <p className="font-mono font-semibold text-[10px] text-zinc-400 dark:text-zinc-600 mt-auto">
          <strong className="text-xs">©</strong> {new Date().getFullYear()} Daniel Barros Moreira. Licensed under the MIT License.
        </p>
      </div>
    </div>
  );
};
