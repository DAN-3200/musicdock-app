import { useCallback, useEffect, useRef, useState } from 'react';
import { SongController } from '../src/infra/song.controller';
import { NativeCommands } from '../src/infra/commands.native';
import {
	DownloadSong,
	GetSearchSuggestions,
	SaveSongDialog,
	SearchVideos,
} from '../wailsjs/go/handlers/Handler';

export interface VideoResult {
	id: string;
	title: string;
	thumbnail: string;
	url: string;
}

// ─── Search hook ─────────────────────────────────────────────────────────────

export function useSearch() {
	const [results, setResults] = useState<VideoResult[]>([]);

	const search = useCallback(async (query: string) => {
		const data = await SearchVideos(query);
		setResults(data);
	}, []);

	return { results, search };
}

// ─── Search suggestions hook ─────────────────────────────────────────────────

export function useSearchSuggestions(input: string) {
	const [suggestions, setSuggestions] = useState<string[]>([]);

	useEffect(() => {
		if (input.trim().length <= 1) {
			setSuggestions([]);
			return;
		}
		const timer = setTimeout(async () => {
			const res = await GetSearchSuggestions(input);
			setSuggestions(res);
		}, 300);
		return () => clearTimeout(timer);
	}, [input]);

	return suggestions;
}

// ─── Queue hook ───────────────────────────────────────────────────────────────

export function useQueue() {
	const [queue, setQueue] = useState<VideoResult[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);

	const activeItem = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null;

	/**
	 * Adiciona ao final da queue se ainda não estiver (deduplicação por id).
	 * Retorna o índice onde o item ficou (existente ou novo).
	 */
	const enqueue = useCallback((video: VideoResult): number => {
		let resultIndex = -1;
		setQueue((prev) => {
			const existing = prev.findIndex((v) => v.id === video.id);
			if (existing >= 0) {
				resultIndex = existing;
				return prev;
			}
			resultIndex = prev.length;
			return [...prev, video];
		});
		return resultIndex;
	}, []);

	/** Remove da queue pelo índice, ajustando o índice ativo atomicamente. */
	const dequeue = useCallback((index: number) => {
		setQueue((prev) => prev.filter((_, i) => i !== index));
		setCurrentIndex((prev) => {
			if (index < prev) return prev - 1;
			if (index === prev) return -1;
			return prev;
		});
	}, []);

	/** Toca a faixa no índice informado. */
	const playAt = useCallback((index: number) => {
		setCurrentIndex(index);
	}, []);

	/**
	 * Enfileira e já toca o vídeo — operação atômica que evita
	 * a race condition de chamar enqueue() + playAt() separados.
	 */
	const enqueueAndPlay = useCallback((video: VideoResult) => {
		setQueue((prev) => {
			const existing = prev.findIndex((v) => v.id === video.id);
			if (existing >= 0) {
				// Já está na queue: só muda o índice
				setCurrentIndex(existing);
				return prev;
			}
			const newIndex = prev.length;
			setCurrentIndex(newIndex);
			return [...prev, video];
		});
	}, []);

	/** Avança para a próxima faixa (sem loop). Bounds verificados via queueRef no usePlayer. */
	const playNext = useCallback(() => {
		setCurrentIndex((prev) => prev + 1);
	}, []);

	/** Volta para a faixa anterior. */
	const playPrev = useCallback(() => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
	}, []);

	return {
		queue,
		currentIndex,
		activeItem,
		enqueue,
		enqueueAndPlay,
		dequeue,
		playAt,
		playNext,
		playPrev,
	};
}

// ─── Player hook ─────────────────────────────────────────────────────────────

export function usePlayer() {
	const [volume, setVolume] = useState(25);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPaused, setIsPaused] = useState(true); // Começa pausado

	const songRef = useRef<SongController | null>(null);

	const {
		queue,
		currentIndex,
		activeItem,
		enqueue,
		enqueueAndPlay,
		dequeue,
		playAt,
		playNext,
		playPrev,
	} = useQueue();

	// Lógica de estado de reprodução
	const isPlaying =
		!isLoading && !!activeItem && currentTime > 0 && currentTime < duration;

	const queueRef = useRef(queue);
	useEffect(() => {
		queueRef.current = queue;
	}, [queue]);

	const currentIndexRef = useRef(currentIndex);
	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
	const hasPrev = currentIndex > 0;

	useEffect(() => {
		if (!activeItem) return;

		let interval: ReturnType<typeof setInterval>;
		let cancelled = false;

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
						const nextIndex = currentIndexRef.current + 1;
						if (nextIndex < queueRef.current.length) {
							playAt(nextIndex);
						}
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
			setIsPaused(true)
			songRef.current?.pause();
			songRef.current = null;
		};
	}, [activeItem?.url]);

	useEffect(() => {
		songRef.current?.setVolume(volume);
	}, [volume]);

	const play = useCallback(() => {
		setIsPaused(false);
		songRef.current?.play();
	}, []);

	const pause = useCallback(() => {
		setIsPaused(true);
		songRef.current?.pause();
	}, []);

	const seek = useCallback((time: number) => {
		setCurrentTime(time);
		songRef.current?.seek(time);
	}, []);

	const download = useCallback(async () => {
		if (!activeItem) return;
		setIsDownloading(true);
		try {
			const path = await SaveSongDialog('musica_download');
			if (!path) return;
			await DownloadSong(activeItem.url, path);
		} catch (err) {
			setError(String(err));
		} finally {
			setIsDownloading(false);
		}
	}, [activeItem]);

	return {
		queue,
		currentIndex,
		activeItem,
		hasNext,
		hasPrev,
		enqueue,
		enqueueAndPlay,
		dequeue,
		playAt,
		playNext,
		playPrev,
		volume,
		setVolume,
		currentTime,
		duration,
		isLoading,
		isDownloading,
		isPlaying, // Adicionado ao retorno
		isPaused,
		error,
		play,
		pause,
		seek,
		download,
	};
}
