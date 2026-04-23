export class SongController {
	private static current: HTMLAudioElement | null = null;
	private audio: HTMLAudioElement;

	constructor(url: string) {
		// para o áudio anterior
		if (SongController.current) {
			SongController.current.pause();
			SongController.current.currentTime = 0;
		}

		this.audio = new Audio(url);
		SongController.current = this.audio;
	}

	Play = async () => {
		await this.audio.play();
	};

	Pause = () => {
		this.audio.pause();
	};

	SetVolume = (value: number) => {
		this.audio.volume = value !== 0 ? value / 100 : 0;
	};

	Stop = () => {
		this.audio.pause();
		this.audio.currentTime = 0;
	};

	Duration = () => {
		return this.formatTime(this.audio.duration);
	};

	SkipForward = (seconds: number) => {
		this.audio.currentTime += seconds;
	};

	formatTime(seconds: number) {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
}
