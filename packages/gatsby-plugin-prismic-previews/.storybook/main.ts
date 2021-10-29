import postcss from "postcss";
import type { StorybookConfig } from "@storybook/react/types";

export default {
	core: {
		builder: "webpack5",
	},
	typescript: {
		check: false,
	},
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	addons: [
		{
			name: "@storybook/addon-postcss",
			options: {
				cssLoaderOptions: {
					importLoaders: 1,
				},
				postcssLoaderOptions: {
					implementation: postcss,
				},
			},
		},
	],
	webpackFinal: (config) => {
		if (config.module?.rules) {
			config.module.rules = config.module.rules.map((rule) => {
				if (
					typeof rule === "object" &&
					rule.test instanceof RegExp &&
					rule.test.test(".css") &&
					Array.isArray(rule.use)
				) {
					return {
						...rule,
						// slice(1) removes `style-loader`
						use: ["to-string-loader", ...rule.use.slice(1)],
					};
				}

				return rule;
			});
		}

		return config;
	},
} as StorybookConfig;
