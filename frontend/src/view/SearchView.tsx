import { useAtomValue } from "jotai";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Check, CornerDownLeft, Loader2 } from "lucide-react";
import { SectionLabel } from "./ui/SectionLabel";
import { formatSeconds } from "../logic/utils";
import { useSearch } from "../logic/useSearch";
import { useMusic } from "../logic/useMusic";
import { isSearchingAtom, queueTrackIdsAtom } from "../logic/atoms";
import type { Track } from "../logic/types";

export const SearchView = () => {
  const { query, setQuery, submitted, suggestions, results, submit, clear } = useSearch();
  const { addToQueue } = useMusic();
  const queueTrackIds = useAtomValue(queueTrackIdsAtom);
  const isSearching = useAtomValue(isSearchingAtom);

  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const inQueue = (id: string) => queueTrackIds.includes(id);

  const showSuggestions =
    focused && query.trim().length > 0 && suggestions.length > 0 && query !== submitted;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
      submit();
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  const pickSuggestion = (t: Track) => {
    setQuery(t.title);
    submit(t.title);
    inputRef.current?.blur();
  };

  return (
    <div className="h-full w-full flex flex-col p-4 gap-3">
      <SectionLabel>Search</SectionLabel>

      <div className="relative">
        <Search
          className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500"
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar e pressione Enter…"
          className="w-full h-8 pl-7 pr-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[12px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                clear();
                inputRef.current?.focus();
              }}
              aria-label="Limpar"
              className="w-5 h-5 grid place-items-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[9px] text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800 px-1 py-0.5">
            <CornerDownLeft className="w-2.5 h-2.5" strokeWidth={2} />
          </kbd>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg max-h-48 overflow-y-auto"
            >
              {suggestions.map((t) => (
                <li key={`sug-${t.id}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(t)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Search className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" strokeWidth={2} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] text-zinc-900 dark:text-zinc-100 truncate">
                        {t.title}
                      </span>
                      <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {t.artist}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Results / hint */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-2 font-mono text-[10px] text-zinc-400 dark:text-zinc-500"
            >
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
              Buscando…
            </motion.div>
          ) : !submitted ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 mt-2"
            >
              Digite e pressione Enter para buscar.
            </motion.p>
          ) : results.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 mt-2"
            >
              Nenhum resultado para "{submitted}".
            </motion.p>
          ) : (
            <motion.ul
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-1"
            >
              {results.map((t, i) => {
                const added = inQueue(t.id);
                return (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.18 }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {t.title}
                      </span>
                      <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {t.artist} · {t.album}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500 shrink-0">
                      {formatSeconds(t.duration)}
                    </span>
                    <motion.button
                      type="button"
                      onClick={() => addToQueue(t)}
                      whileTap={{ scale: 0.9 }}
                      aria-label={added ? "Adicionar novamente" : "Adicionar à fila"}
                      className="w-6 h-6 grid place-items-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    >
                      {added ? (
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      ) : (
                        <Plus className="w-3 h-3" strokeWidth={2.5} />
                      )}
                    </motion.button>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
