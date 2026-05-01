import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			// Define que '@/logic' aponta para a pasta 'src/logic'
			'@/logic': path.resolve(__dirname, './src/logic'),
		},
	},
});
