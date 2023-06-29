import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	plugins: [sdk({ internalDependencies: ["p-queue"] })],
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				"gatsby-node": "./src/gatsby-node/index.ts",
			},
			formats: ["cjs"],
		},
	},
	test: {
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__"],
	},
});
