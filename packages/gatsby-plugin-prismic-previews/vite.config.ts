import react from "@vitejs/plugin-react";
import { UserConfig, defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig(({ mode }) => {
	const config: UserConfig = {
		plugins: [react(), sdk()],
		build: {
			lib: {
				entry: [
					"./src/index.ts",
					"./src/gatsby-node.ts",
					"./src/gatsby-browser.ts",
					"./src/gatsby-ssr.ts",
				],
				formats: ["cjs"],
			},
		},
		test: {
			// Required to register jest-dom matchers and retain TypeScript support.
			globals: true,
			coverage: {
				provider: "v8",
				reporter: ["lcovonly", "text"],
			},
			setupFiles: ["./test/__setup__"],
		},
	};

	if (mode === "test") {
		config.define = {
			...config.define,
			__PUBLIC_MODELS_PATH__: JSON.stringify("https://example.com/models.json"),
		};
	}

	return config;
});
