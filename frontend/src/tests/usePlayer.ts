import { useCallback, useEffect, useRef, useState } from 'react';
import { SongController } from '../infra/song.controller';
import { NativeCommands } from '../infra/commands.native';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoResult {
	id: string;
	title: string;
	thumbnail: string;
	url: string;
}

// ─── useSearch ────────────────────────────────────────────────────────────────

export function useSearch() {
	const [results, setResults] = useState<VideoResult[]>([]);

	const search = useCallback(async (query: string) => {
		const data = await NativeCommands.SearchVideos(query);
		setResults(data);
	}, []);

	return { results, search };
}

// ─── useSearchSuggestions ─────────────────────────────────────────────────────

export function useSearchSuggestions(input: string) {
	const [suggestions, setSuggestions] = useState<string[]>([]);

	useEffect(() => {
		if (input.trim().length <= 1) {
			setSuggestions([]);
			return;
		}
		const timer = setTimeout(async () => {
			setSuggestions(await NativeCommands.GetSearchSuggestions(input));
		}, 300);
		return () => clearTimeout(timer);
	}, [input]);

	return suggestions;
}

// ─── usePlayer ────────────────────────────────────────────────────────────────

export function usePlayer() {
	const [queue, setQueue] = useState<VideoResult[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);

	const [volume, setVolume] = useState(25);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isPaused, setIsPaused] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const songRef = useRef<SongController | null>(null);

	const liveRef = useRef({ queue, currentIndex });
	useEffect(() => { liveRef.current = { queue, currentIndex }; }, [queue, currentIndex]);

	const activeItem = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null;
	const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
	const hasPrev = currentIndex > 0;
	const isPlaying = !isLoading && !!activeItem && currentTime > 0 && currentTime < duration;

	const enqueue = useCallback((video: VideoResult) => {
		setQueue((prev) => prev.some((v) => v.id === video.id) ? prev : [...prev, video]);
	}, []);

	const enqueueAndPlay = useCallback((video: VideoResult) => {
		setQueue((prev) => {
			const existing = prev.findIndex((v) => v.id === video.id);
			if (existing >= 0) { setCurrentIndex(existing); return prev; }
			setCurrentIndex(prev.length);
			return [...prev, video];
		});
	}, []);

	const dequeue = useCallback((index: number) => {
		setQueue((prev) => prev.filter((_, i) => i !== index));
		setCurrentIndex((prev) => {
			if (index < prev) return prev - 1;
			if (index === prev) return -1;
			return prev;
		});
	}, []);

	const playAt = useCallback((index: number) => setCurrentIndex(index), []);
	const playNext = useCallback(() => setCurrentIndex((i) => i + 1), []);
	const playPrev = useCallback(() => setCurrentIndex((i) => (i > 0 ? i - 1 : i)), []);

	const play = useCallback(() => { setIsPaused(false); songRef.current?.play(); }, []);
	const pause = useCallback(() => { setIsPaused(true); songRef.current?.pause(); }, []);
	const seek  = useCallback((time: number) => { setCurrentTime(time); songRef.current?.seek(time); }, []);

	const download = useCallback(async () => {
		if (!activeItem) return;
		setIsDownloading(true);
		try {
			const path = await NativeCommands.SaveSongDialog();
			if (!path) return;
			await NativeCommands.DownloadSong(activeItem.url, path);
		} catch (err) {
			setError(String(err));
		} finally {
			setIsDownloading(false);
		}
	}, [activeItem]);

	useEffect(() => {
		if (!activeItem) return;
		let cancelled = false;
		let interval: ReturnType<typeof setInterval>;

		const load = async () => {
			songRef.current?.pause();
			songRef.current = null;
			setIsLoading(true);
			setError(null);
			setCurrentTime(0);
			setDuration(0);

			try {
				const directUrl = await NativeCommands.GetAudioUrl(activeItem.url);
				if (cancelled) return;
				const controller = new SongController(directUrl);
				controller.setVolume(volume);
				songRef.current = controller;

				interval = setInterval(() => {
					if (!songRef.current) return;
					const progress = songRef.current.progress;
					const dur = songRef.current.duration;
					setCurrentTime(progress);
					setDuration(dur);
					if (dur > 0 && progress >= dur - 0.5) {
						const { queue: q, currentIndex: ci } = liveRef.current;
						if (ci + 1 < q.length) playAt(ci + 1);
					}
				}, 500);
			} catch (err) {
				if (!cancelled) setError(String(err));
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		load();
		return () => {
			cancelled = true;
			clearInterval(interval);
			setIsPaused(true);
			songRef.current?.pause();
			songRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeItem?.url]);

	useEffect(() => { songRef.current?.setVolume(volume); }, [volume]);

	return {
		queue, currentIndex, activeItem, hasNext, hasPrev,
		enqueue, enqueueAndPlay, dequeue, playAt, playNext, playPrev,
		volume, setVolume, currentTime, duration,
		isLoading, isDownloading, isPlaying, isPaused, error,
		play, pause, seek, download,
	};
}
