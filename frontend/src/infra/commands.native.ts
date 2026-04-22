import * as wails from '../../../frontend/wailsjs/go/handlers/App';
import { WindowMinimise, WindowHide } from '../../wailsjs/runtime';

export class NativeCommands {
	static Minimizar = async () => {
		await WindowMinimise();
	};

	static CloseWindow = async () => {
		await wails.CloseWindow();
	};

	static getUrl = () => {
		return 'http://localhost:8080/stream';
	};

	static WindowHide = () => {
		WindowHide()
	}
}
