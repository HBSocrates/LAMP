import { postgres } from "vite-plugin-neon-new";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		postgres({
			referrer: "github:/HBSocrates/LAMP", // REQUIRED
		}),
		react(),
	],
});