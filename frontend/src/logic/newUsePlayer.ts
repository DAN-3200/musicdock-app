import { useCallback, useEffect, useRef, useState } from 'react';
import { LoopMode, VideoResult } from './usePlayer';
import { SongController } from '../infra/song.controller';
import { NativeCommands } from '../infra/commands.native';

export function useQueue() {
	const [queue, setQueue] = useState<VideoResult[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);

	const activeItem = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null;

	const enqueue = useCallback((video: VideoResult) => {
		setQueue((prev) =>
			prev.some((v) => v.id === video.id) ? prev : [...prev, video],
		);
	}, []);

	const enqueueAndPlay = useCallback((video: VideoResult) => {
		setQueue((prev) => {
			const existing = prev.findIndex((v) => v.id === video.id);
			if (existing >= 0) {
				setCurrentIndex(existing);
				return prev;
			}
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

	return {
		queue,
		currentIndex,
		activeItem,
		enqueue,
		enqueueAndPlay,
		dequeue,
		playAt,
	};
}

export function usePlaybackModes() {
	const [autoplay, setAutoplay] = useState(true);
	const [shuffle, setShuffle] = useState(false);
	const [loop, setLoop] = useState<LoopMode>('off');

	const toggleAutoplay = useCallback(() => setAutoplay((v) => !v), []);
	const toggleShuffle = useCallback(() => setShuffle((v) => !v), []);
	const cycleLoop = useCallback(
		() => setLoop((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off')),
		[],
	);

	return { autoplay, shuffle, loop, toggleAutoplay, toggleShuffle, cycleLoop };
}

// Interfaces para DI
interface AudioService {
	GetAudioUrl: (url: string) => Promise<string>;
	DownloadSong: (url: string, path: string) => Promise<void>;
	SaveSongDialog: () => Promise<string | null>;
}

export function usePlayerX(audioService: AudioService = NativeCommands) {
	const queue = useQueue();
	const modes = usePlaybackModes();

	const [volume, setVolume] = useState(25);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isPaused, setIsPaused] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const songRef = useRef<SongController | null>(null);

	// Atualização do liveRef apontando para as propriedades de queue e modes
	const liveRef = useRef({
		queue: queue.queue,
		currentIndex: queue.currentIndex,
		autoplay: modes.autoplay,
		shuffle: modes.shuffle,
		loop: modes.loop,
	});

	useEffect(() => {
		liveRef.current = {
			queue: queue.queue,
			currentIndex: queue.currentIndex,
			autoplay: modes.autoplay,
			shuffle: modes.shuffle,
			loop: modes.loop,
		};
	}, [
		queue.queue,
		queue.currentIndex,
		modes.autoplay,
		modes.shuffle,
		modes.loop,
	]);

	// Propriedades Derivadas
	const hasNext =
		queue.queue.length > 0 &&
		(modes.loop === 'all' ||
			modes.shuffle ||
			queue.currentIndex < queue.queue.length - 1);

	const hasPrev =
		queue.queue.length > 0 &&
		(modes.loop === 'all' || modes.shuffle || queue.currentIndex > 0);

	const isPlaying =
		!isLoading &&
		!!queue.activeItem &&
		currentTime > 0 &&
		currentTime < duration;

	// Helpers de Navegação Pura
	const pickNextIndex = useCallback((opts: { fromAutoEnd: boolean }) => {
		const {
			queue: q,
			currentIndex: ci,
			shuffle: sh,
			loop: lp,
		} = liveRef.current;
		if (q.length === 0) return -1;
		if (opts.fromAutoEnd && lp === 'one') return ci;
		if (sh) {
			if (q.length === 1) return lp === 'off' && opts.fromAutoEnd ? -1 : 0;
			let next = ci;
			while (next === ci) next = Math.floor(Math.random() * q.length);
			return next;
		}
		if (ci + 1 < q.length) return ci + 1;
		if (lp === 'all') return 0;
		return -1;
	}, []);

	const pickPrevIndex = useCallback(() => {
		const {
			queue: q,
			currentIndex: ci,
			shuffle: sh,
			loop: lp,
		} = liveRef.current;
		if (q.length === 0) return -1;
		if (sh) {
			if (q.length === 1) return 0;
			let prev = ci;
			while (prev === ci) prev = Math.floor(Math.random() * q.length);
			return prev;
		}
		if (ci - 1 >= 0) return ci - 1;
		if (lp === 'all') return q.length - 1;
		return ci;
	}, []);

	// Ações do Player
	const playNext = useCallback(() => {
		const next = pickNextIndex({ fromAutoEnd: false });
		if (next >= 0) queue.playAt(next);
	}, [pickNextIndex, queue]);

	const playPrev = useCallback(() => {
		const prev = pickPrevIndex();
		if (prev >= 0) queue.playAt(prev);
	}, [pickPrevIndex, queue]);

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
		if (!queue.activeItem) return;
		setIsDownloading(true);
		try {
			const path = await audioService.SaveSongDialog();
			if (!path) return;
			await audioService.DownloadSong(queue.activeItem.url, path);
		} catch (err) {
			setError(String(err));
		} finally {
			setIsDownloading(false);
		}
	}, [queue.activeItem, audioService]);

	// Motor Principal de Reprodução
	useEffect(() => {
		if (!queue.activeItem) return;
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
				const directUrl = await audioService.GetAudioUrl(
					queue.activeItem?.url!,
				);
				if (cancelled) return;
				const controller = new SongController(directUrl);
				controller.setVolume(volume);
				songRef.current = controller;

				if (modes.autoplay) {
					controller.play();
					setIsPaused(false);
				}

				interval = setInterval(() => {
					if (!songRef.current) return;
					const progress = songRef.current.progress;
					const dur = songRef.current.duration;
					setCurrentTime(progress);
					setDuration(dur);

					if (dur > 0 && progress >= dur - 0.5) {
						const { autoplay: ap, loop: lp } = liveRef.current;

						if (lp === 'one') {
							songRef.current.seek(0);
							setCurrentTime(0);
							return;
						}

						if (ap) {
							const next = pickNextIndex({ fromAutoEnd: true });
							if (next >= 0) queue.playAt(next);
						} else {
							setIsPaused(true);
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
			setIsPaused(true);
			songRef.current?.pause();
			songRef.current = null;
		};
		// O hook do React avisaria sobre volume faltando na dep array, mas manter fora de dep
		// array para o 'interval' é seguro com refs. Focamos nos re-triggers por mudança de música.
	}, [queue.activeItem?.url, pickNextIndex, queue, audioService]);

	useEffect(() => {
		songRef.current?.setVolume(volume);
	}, [volume]);

	// Retorno Agrupado
	return {
		queue,
		modes,
		hasNext,
		hasPrev,
		playNext,
		playPrev,
		volume,
		setVolume,
		currentTime,
		duration,
		isLoading,
		isDownloading,
		isPlaying,
		isPaused,
		error,
		play,
		pause,
		seek,
		download,
	};
}
