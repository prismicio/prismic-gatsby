import dotenv from "dotenv";
import fs from "fs";
import type { GatsbyConfig } from "gatsby";
import type { PluginOptions as GatsbyPluginPrismicPreviewsPluginOptions } from "gatsby-plugin-prismic-previews";
import type { PluginOptions as GatsbySourcePrismicPluginOptions } from "gatsby-source-prismic";
import path from "path";

import { linkResolver } from "./src/linkResolver";

dotenv.config();

const customTypeModels = fs
	.readdirSync("customtypes", { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) =>
		require(path.resolve("customtypes", entry.name, "index.json")),
	);

const sharedSliceModels = fs
	.readdirSync(path.join("src", "slices"), { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) =>
		require(path.resolve("src", "slices", entry.name, "model.json")),
	);

const config: GatsbyConfig = {
	jsxRuntime: "automatic",
	siteMetadata: {
		siteUrl: "https://www.yourdomain.tld",
		title: "Test Site",
	},
	plugins: [
		"gatsby-plugin-image",
		process.env.ANALYZE && "gatsby-plugin-webpack-bundle-analyser-v2",
		{
			resolve: "gatsby-source-prismic",
			options: {
				repositoryName: "gatsby-source-prismic-v4",
				accessToken:
					"MC5ZVHd6amhFQUFDUUFOQVNq.Jyg977-977-9Wyfvv73vv73vv73vv73vv73vv73vv73vv73vv73vv73vv70h77-977-977-977-9Pu-_vXbvv73vv71PR--_ve-_vQ",
				customTypesApiToken: process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN,
				customTypeModels: [
					// require("./customtypes/article/index.json"),
					// require("./customtypes/navigation/index.json"),
					require("./customtypes/page/index.json"),
					// require("./customtypes/settings/index.json"),
				],
				sharedSliceModels,
				linkResolver,
			} as GatsbySourcePrismicPluginOptions,
		},
		{
			resolve: "gatsby-plugin-prismic-previews",
			options: {
				repositoryName: "gatsby-source-prismic-v4",
				accessToken:
					"MC5ZVHd6amhFQUFDUUFOQVNq.Jyg977-977-9Wyfvv73vv73vv73vv73vv73vv73vv73vv73vv73vv73vv70h77-977-977-977-9Pu-_vXbvv73vv71PR--_ve-_vQ",
			} as GatsbyPluginPrismicPreviewsPluginOptions,
		},
	].filter((plugin): plugin is NonNullable<typeof plugin> => Boolean(plugin)),
};

export default config;
