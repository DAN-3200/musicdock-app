import { AnimatePresence, motion } from "framer-motion";
import { useMusicContext } from "@/logic/MusicContext";
import { TitleBar } from "./TitleBar";
import { PlayerView } from "./PlayerView";
import { SearchView } from "./SearchView";
import { QueueView } from "./QueueView";
import { ConfigView } from "./ConfigView";
import { MusicProvider } from "@/logic/MusicContext";

const Shell = () => {
  const { tab, settings } = useMusicContext();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={settings.dark ? "dark" : ""}
    >
      <div className="bg-secondary border border-border shadow-2xl w-full max-w-[380px] h-[600px] sm:h-[600px] p-2 flex flex-col gap-2 transition-colors duration-300 rounded-lg mx-auto">
        <TitleBar />
        <div className="bg-background rounded-sm border border-border flex-1 overflow-hidden relative transition-colors duration-300">
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

export const MusicGadget = () => (
  <MusicProvider>
    <Shell />
  </MusicProvider>
);

export default MusicGadget;
