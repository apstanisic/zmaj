// @ts-check
/* eslint-env node */
import react from "@vitejs/plugin-react-swc"
import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig((config) => {
	return {
		plugins: [react()],
		base: "/admin",
		// optimizeDeps: { disabled: false },
		define: {
			__APP_URL__: JSON.stringify(
				config.mode === "production" ? "/admin/" : "http://localhost:5173/admin",
			), //
			__API_URL__: JSON.stringify(
				config.mode === "production" ? "/api" : "http://localhost:5000/api",
			), //
		},
		resolve: {
			alias: {
				"@admin-panel": resolve(__dirname, "src"),
			},
		},
		build: {
			// lib: {
			// 	entry: resolve(__dirname, "src/ZmajAdminPanel.tsx"),
			// 	// name: "ZmajAdminPanel",
			// 	formats: ["es"],
			// },
			// minify: false,

			// TODO, Reduce size, not priority right now
			chunkSizeWarningLimit: 5000,
		},
	}
})
