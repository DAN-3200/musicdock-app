import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import {
  isSearchingAtom,
  searchQueryAtom,
  searchResultsAtom,
  searchSubmittedAtom,
  suggestionsAtom,
} from "./atoms";
import { fetchSuggestions, searchCatalog } from "../infra/catalog";

export const useSearch = () => {
  const [query, setQuery] = useAtom(searchQueryAtom);
  const [submitted, setSubmitted] = useAtom(searchSubmittedAtom);
  const [suggestions, setSuggestions] = useAtom(suggestionsAtom);
  const [results, setResults] = useAtom(searchResultsAtom);
  const setIsSearching = useSetAtom(isSearchingAtom);
  const debounceRef = useRef<number | null>(null);

  // Live suggestions while typing (debounced)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      const s = await fetchSuggestions(query);
      setSuggestions(s);
    }, 150);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, setSuggestions]);

  const submit = useCallback(
    async (q?: string) => {
      const term = (q ?? query).trim();
      if (!term) return;
      setIsSearching(true);
      setSubmitted(term);
      const r = await searchCatalog(term);
      setResults(r);
      setIsSearching(false);
    },
    [query, setIsSearching, setSubmitted, setResults]
  );

  const clear = useCallback(() => {
    setQuery("");
    setSubmitted("");
    setSuggestions([]);
    setResults([]);
  }, [setQuery, setSubmitted, setSuggestions, setResults]);

  return {
    query,
    setQuery,
    submitted,
    suggestions,
    results,
    submit,
    clear,
  };
};
