import { defineSirocConfig } from "siroc";
import postcss from "rollup-plugin-postcss";
import * as fs from "fs";
import * as path from "path";

export default defineSirocConfig({
	rollup: {
		plugins: [postcss({ inject: false })],
		output: { sourcemap: true },
	},
	hooks: {
		"build:done": () => {
			console.log("Copying static files from ./static into ./dist");

			const staticDir = path.resolve("./static");
			const files = fs.readdirSync(staticDir);

			for (const file of files) {
				fs.copyFileSync(
					path.resolve(staticDir, file),
					path.resolve("./dist", file),
				);
			}
		},
	},
});
