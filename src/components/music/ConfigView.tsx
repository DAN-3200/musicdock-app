import { motion } from "framer-motion";
import { Sun, Moon, PlayCircle } from "lucide-react";
import { useMusicContext } from "@/logic/MusicContext";
import { SectionLabel, Toggle } from "./Primitives";

export const ConfigView = () => {
  const { settings, setSettings } = useMusicContext();

  return (
    <div className="h-full w-full flex flex-col p-3 sm:p-4 gap-4 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <SectionLabel>Preferences</SectionLabel>
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between text-[12px] text-foreground">
            <span className="inline-flex items-center gap-1.5">
              <PlayCircle className="w-3.5 h-3.5" strokeWidth={2} />
              Autoplay
            </span>
            <Toggle
              checked={settings.autoplay}
              onChange={(v) => setSettings({ autoplay: v })}
              label="Autoplay"
            />
          </label>
          <label className="flex items-center justify-between text-[12px] text-foreground">
            <span>Shuffle</span>
            <Toggle
              checked={settings.shuffle}
              onChange={(v) => setSettings({ shuffle: v })}
              label="Shuffle"
            />
          </label>
          <label className="flex items-center justify-between text-[12px] text-foreground">
            <span>Crossfade</span>
            <Toggle
              checked={settings.crossfade}
              onChange={(v) => setSettings({ crossfade: v })}
              label="Crossfade"
            />
          </label>
          <label className="flex items-center justify-between text-[12px] text-foreground">
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

      <div className="mt-auto pt-2 border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground">
          Music · Atomic UI Kit
        </p>
        <p className="font-mono font-semibold text-[10px] text-muted-foreground mt-auto">
          <strong className="text-xs">©</strong> {new Date().getFullYear()}{" "}
          Daniel Barros Moreira. Licensed under the MIT License.
        </p>
      </div>
    </div>
  );
};
