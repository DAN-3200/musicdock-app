import { NativeCommands } from './commands.native';

export class SongController {
	private audio: HTMLAudioElement;
	private static instanceUrl: string | null = null;

	constructor(url: string) {
		this.audio = new Audio(url);
	}

	Play = async () => {
		await this.audio.play();
	};

	Pause = () => {
		this.audio.pause();
	};

	SetVolume = (value: number) => {
		this.audio.volume = value != 0 ? value / 100 : 0;
	};

	Stop = () => {
		this.audio.pause();
		this.audio.currentTime = 0;
	};
}

export const createSongController = async () => {
	if (!SongController["instanceUrl"]) {
		SongController["instanceUrl"] = await NativeCommands.StartStreamServer();
	}
	return new SongController(SongController["instanceUrl"]);
};