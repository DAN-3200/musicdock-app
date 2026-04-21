import * as wails from '../../../frontend/wailsjs/go/commands/App';

export class NativeCommands {
	static Minimizar = async () => {
		await wails.Minimize();
	};

	static CloseWindow = async () => {
		await wails.CloseWindow();
	};

	static StartStreamServer = async (): Promise<string> => {
		return await wails.StartStreamServer();
	};

	static GetSong = async (url: string): Promise<string> => {
		return await wails.GetSong(url);
	};
}
