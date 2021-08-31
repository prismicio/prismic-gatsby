// This customized `esbuild-register` allows importing `.css` files as text.
//
// It is not necessary for tests to run through PostCSS since we are not running
// any styling tests.
require("esbuild-register/dist/node").register({
	target: `node${process.version.slice(1)}`,
	loaders: {
		".js": "js",
		".jsx": "jsx",
		".ts": "ts",
		".tsx": "tsx",
		".mjs": "js",
		".css": "text",
	},
});
