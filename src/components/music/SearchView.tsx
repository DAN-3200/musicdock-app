import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Plus, Check } from "lucide-react";
import { useMusicContext } from "@/logic/MusicContext";
import { formatSeconds } from "@/logic/utils";
import type { Track } from "@/logic/types";
import { SectionLabel } from "./Primitives";

const TrackRow = ({
  track,
  inQueue,
  onAdd,
}: {
  track: Track;
  inQueue: boolean;
  onAdd: () => void;
}) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted group"
  >
    {track.thumbnail && (
      <img
        src={track.thumbnail}
        alt={track.title}
        className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-sm shrink-0 border border-border"
      />
    )}
    <span className="flex-1 min-w-0">
      <span className="block text-[12px] font-medium truncate text-foreground">
        {track.title}
      </span>
      <span className="block text-[10px] truncate text-muted-foreground">
        {track.artist} · {track.album}
      </span>
    </span>
    <span className="font-mono text-[10px] tabular-nums shrink-0 text-muted-foreground">
      {formatSeconds(track.duration)}
    </span>
    <button
      type="button"
      onClick={onAdd}
      disabled={inQueue}
      aria-label={inQueue ? "Already queued" : "Add to queue"}
      className={`w-5 h-5 grid place-items-center transition-colors focus:outline-none ${
        inQueue
          ? "text-emerald-600"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {inQueue ? (
        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
      ) : (
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
      )}
    </button>
  </motion.li>
);

export const SearchView = () => {
  const {
    addToQueue,
    query, setQuery, submittedQuery, isSearching,
    searchResults, suggestions, liveResults,
    submitSearch, clearSearch, queue,
  } = useMusicContext();

  const queuedSet = useMemo(() => new Set(queue.map((q) => q.track.id)), [queue]);

  const showSubmittedResults = submittedQuery.length > 0;
  const showLive = query.trim().length > 0 && !showSubmittedResults;
  const displayTracks = showSubmittedResults ? searchResults : showLive ? liveResults : suggestions;
  const sectionLabel = showSubmittedResults
    ? `Results for "${submittedQuery}"`
    : showLive
    ? "Matching"
    : "Suggestions";

  return (
    <div className="h-full w-full flex flex-col p-3 sm:p-4 gap-3">
      <div className="flex flex-col gap-2">
        <SectionLabel>Search</SectionLabel>
        <form
          onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
          className="relative flex items-center"
        >
          <Search className="w-3.5 h-3.5 absolute left-2 text-muted-foreground" strokeWidth={2} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks, artists, albums..."
            className="w-full pl-7 pr-7 py-1.5 text-[12px] bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground rounded-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear"
              className="absolute right-1.5 w-5 h-5 grid place-items-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}
        </form>
      </div>

      <div className="flex-1 overflow-auto -mx-1 px-1">
        {isSearching ? (
          <p className="font-mono text-[10px] text-muted-foreground mt-2">Searching…</p>
        ) : displayTracks.length === 0 && showSubmittedResults ? (
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            No results for "{submittedQuery}".
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <SectionLabel>{sectionLabel}</SectionLabel>
            <ul className="flex flex-col gap-0.5">
              <AnimatePresence initial={false}>
                {displayTracks.map((t) => (
                  <TrackRow
                    key={t.id}
                    track={t}
                    inQueue={queuedSet.has(t.id)}
                    onAdd={() => addToQueue(t)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
