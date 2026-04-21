import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import {
	currentIndexAtom,
	currentTrackAtom,
	currentUidAtom,
	isPlayingAtom,
	makeUid,
	positionAtom,
	progressAtom,
	queueAtom,
	safeIndexAtom,
	settingsAtom,
} from './atoms';
import type { MusicSettings, RepeatMode, Track } from './types';
import { streamAudio } from '../infra/musicApi';

export const useMusic = () => {
	const [queue, setQueue] = useAtom(queueAtom);
	const [currentIndex, setCurrentIndex] = useAtom(currentIndexAtom);
	const [position, setPosition] = useAtom(positionAtom);
	const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
	const [settings, setSettingsState] = useAtom(settingsAtom);
	const safeIndex = useAtomValue(safeIndexAtom);
	const current = useAtomValue(currentTrackAtom);
	const currentUid = useAtomValue(currentUidAtom);
	const progress = useAtomValue(progressAtom);

	const intervalRef = useRef<number | null>(null);

	const next = useCallback(() => {
		setPosition(0);
		setCurrentIndex((i) => {
			if (queue.length === 0) return 0;
			if (settings.shuffle) {
				if (queue.length === 1) return 0;
				let r = i;
				while (r === i) r = Math.floor(Math.random() * queue.length);
				return r;
			}
			const nextI = i + 1;
			if (nextI >= queue.length) {
				return settings.repeat === 'all' ? 0 : i;
			}
			return nextI;
		});
	}, [
		queue.length,
		settings.shuffle,
		settings.repeat,
		setCurrentIndex,
		setPosition,
	]);

	const prev = useCallback(() => {
		if (position > 3) {
			setPosition(0);
			return;
		}
		setCurrentIndex(
			(i) => (i - 1 + queue.length) % Math.max(queue.length, 1),
		);
		setPosition(0);
	}, [position, queue.length, setCurrentIndex, setPosition]);

	const playQueueItem = useCallback(
		(uid: string) => {
			const idx = queue.findIndex((it) => it.uid === uid);
			if (idx >= 0) setCurrentIndex(idx);
			setPosition(0);
			setIsPlaying(true);
		},
		[queue, setCurrentIndex, setPosition, setIsPlaying],
	);

	const addToQueue = useCallback(
		(track: Track) => {
			setQueue((q) => [...q, { uid: makeUid(track.id), track }]);
		},
		[setQueue],
	);

	const removeFromQueue = useCallback(
		(uid: string) => {
			const idx = queue.findIndex((it) => it.uid === uid);
			if (idx < 0) return;
			const nextQueue = queue.filter((it) => it.uid !== uid);
			setQueue(nextQueue);
			if (idx < currentIndex) setCurrentIndex((c) => c - 1);
			else if (idx === currentIndex) {
				setPosition(0);
				setCurrentIndex(
					Math.min(currentIndex, Math.max(0, nextQueue.length - 1)),
				);
			}
		},
		[queue, currentIndex, setQueue, setCurrentIndex, setPosition],
	);

	const clearQueue = useCallback(() => {
		setQueue([]);
		setCurrentIndex(0);
		setPosition(0);
		setIsPlaying(false);
	}, [setQueue, setCurrentIndex, setPosition, setIsPlaying]);

	const toggle = useCallback(() => {
		if (queue.length === 0) return;
		setIsPlaying((p) => !p);
		// streamAudio.play()
	}, [queue.length, setIsPlaying]);

	const seek = useCallback(
		(pct: number) =>
			setPosition(Math.max(0, Math.min(1, pct)) * current.duration),
		[current.duration, setPosition],
	);

	const setSettings = useCallback(
		(patch: Partial<MusicSettings>) => {
			setSettingsState((s) => ({ ...s, ...patch }));
		},
		[setSettingsState],
	);

	const cycleRepeat = useCallback(() => {
		const order: RepeatMode[] = ['off', 'all', 'one'];
		setSettingsState((s) => ({
			...s,
			repeat: order[(order.indexOf(s.repeat) + 1) % order.length],
		}));
	}, [setSettingsState]);

	// Tick
	useEffect(() => {
		if (!isPlaying || queue.length === 0) {
			if (intervalRef.current) window.clearInterval(intervalRef.current);
			intervalRef.current = null;
			return;
		}
		intervalRef.current = window.setInterval(() => {
			setPosition((p) =>
				p + 1 >= current.duration ? current.duration : p + 1,
			);
		}, 1000);
		return () => {
			if (intervalRef.current) window.clearInterval(intervalRef.current);
		};
	}, [isPlaying, current.duration, queue.length, setPosition]);

	// Auto-advance
	useEffect(() => {
		if (position >= current.duration && isPlaying && queue.length > 0) {
			if (settings.repeat === 'one') {
				setPosition(0);
				return;
			}
			const isLast = currentIndex >= queue.length - 1;
			if (isLast && settings.repeat === 'off' && !settings.shuffle) {
				setIsPlaying(false);
				setPosition(current.duration);
				return;
			}
			next();
		}
	}, [
		position,
		current.duration,
		isPlaying,
		settings.repeat,
		settings.shuffle,
		currentIndex,
		queue.length,
		next,
		setIsPlaying,
		setPosition,
	]);

	return {
		queue,
		currentIndex: safeIndex,
		currentUid,
		current,
		position,
		progress,
		isPlaying,
		settings,
		toggle,
		next,
		prev,
		seek,
		playQueueItem,
		addToQueue,
		removeFromQueue,
		clearQueue,
		setSettings,
		cycleRepeat,
	};
};
