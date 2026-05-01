import * as wails from '../../../frontend/wailsjs/go/handlers/Handler';
import { WindowMinimise, WindowHide } from '../../wailsjs/runtime';

export class NativeCommands {
	static Minimizar = async () => {
		await WindowMinimise();
	};

	static CloseWindow = async () => {
		await wails.CloseWindow();
	};

	static SaveSongDialog = async () => {
		return await wails.SaveSongDialog('minha_musica');
	};

	static GetAudioUrl = async (url: string) => {
		return await wails.GetAudioUrl(url);
	};

	static DownloadSong = async (url: string, pathName: string) => {
		await wails.DownloadSong(url, pathName);
	};

	static WindowHide = () => {
		WindowHide();
	};

	static GetSearchSuggestions = async (input: string) => {
		return await wails.GetSearchSuggestions(input);
	};

	static SearchVideos = async (query: string) => {
		return await wails.SearchVideos(query);
	};
}
