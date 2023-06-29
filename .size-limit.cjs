const pkg = require("./package.json");

module.exports = pkg.workspaces
	.map((workspace) => {
		const pkg = require(`./${workspace}/package.json`);

		return [pkg.module, pkg.main]
			.filter(Boolean)
			.map((file) => `./${workspace}/${file}`);
	})
	.flat()
	.map((path) => ({
		path,
		ignore: ["react", "gatsby", "gatsby-plugin-image"],
		modifyEsbuildConfig: (config) => {
			// Silence warnings when removing side-effect-free modules.
			config.logLevel = "error";

			// Add JSX support.
			config.loader = {
				...config.loader,
				".js": "jsx",
			};

			return config;
		},
	}));
