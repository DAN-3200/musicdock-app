export class SongController {
	private static currentInstance: HTMLAudioElement | null = null;
	private readonly audio: HTMLAudioElement;

	constructor(url: string) {
		this.stopPreviousInstance();

		this.audio = new Audio(url);
		this.audio.preload = 'auto'; // Garante carregamento mais rápido
		SongController.currentInstance = this.audio;
	}

	private stopPreviousInstance(): void {
		if (SongController.currentInstance) {
			SongController.currentInstance.pause();
			SongController.currentInstance.src = ''; // Libera recursos de rede/memória
			SongController.currentInstance.load();
		}
	}

	public async play(): Promise<void> {
		try {
			await this.audio.play();
		} catch (error) {
			console.error('Erro ao reproduzir áudio:', error);
		}
	}

	public pause(): void {
		this.audio.pause();
	}

	public stop(): void {
		this.audio.pause();
		this.audio.currentTime = 0;
	}

	/**
	 * Define o volume (0 a 100)
	 */
	public setVolume(value: number): void {
		const normalizedVolume = Math.max(0, Math.min(value / 100, 1));
		this.audio.volume = normalizedVolume;
	}

	/**
	 * Realiza o seek para um tempo específico em segundos
	 */
	public seek(seconds: number): void {
		if (!isFinite(seconds)) return;
		this.audio.currentTime = seconds;
	}

	public skip(seconds: number): void {
		this.seek(this.audio.currentTime + seconds);
	}

	// --- Getters para facilitar o uso no React ---

	public get progress(): number {
		return this.audio.currentTime;
	}

	public get duration(): number {
		// Retorna 0 se o áudio ainda não carregou os metadados (evita NaN)
		return isFinite(this.audio.duration) ? this.audio.duration : 0;
	}

	/**
	 * Método utilitário estático para formatação,
	 * mantendo a lógica de UI separada da lógica de estado.
	 */
	public static formatTime(seconds: number): string {
		if (!seconds || isNaN(seconds)) return '0:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
}
