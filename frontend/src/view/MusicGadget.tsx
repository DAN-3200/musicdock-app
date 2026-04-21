import { Provider, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { TitleBar } from "./TitleBar";
import { PlayerView } from "./PlayerView";
import { SearchView } from "./SearchView";
import { QueueView } from "./QueueView";
import { ConfigView } from "./ConfigView";
import { settingsAtom, tabAtom } from "../logic/atoms";
import { NativeCommands } from "../infra/commands.native";

const Shell = () => {
  const tab = useAtomValue(tabAtom);
  const isDark = useAtomValue(settingsAtom).dark;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={isDark ? "dark" : ""}
    >
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl w-screen h-screen p-2 flex flex-col gap-2 transition-colors duration-300">
        <TitleBar onMinimize={NativeCommands.Minimizar} onClose={NativeCommands.CloseWindow} />
        <div className="bg-white rounded-sm dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex-1 overflow-hidden relative transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {tab === "player" && <PlayerView />}
              {tab === "search" && <SearchView />}
              {tab === "queue" && <QueueView />}
              {tab === "config" && <ConfigView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Scoped Jotai Provider keeps the music gadget state fully isolated.
export const MusicGadget = () => (
  <Provider>
    <Shell />
  </Provider>
);
