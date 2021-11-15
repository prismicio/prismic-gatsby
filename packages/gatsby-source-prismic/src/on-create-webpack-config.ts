import * as gatsby from "gatsby";
import * as gatsbyPrismic from "gatsby-source-prismic";
import md5 from "tiny-hashes/md5";

import { PluginOptions } from "./types";

export const onCreateWebpackConfig: gatsby.GatsbyNode["onCreateWebpackConfig"] =
	async (gatsbyContext, _pluginOptions: PluginOptions) => {
		const typePathsExportStore = await gatsbyPrismic.getExportedTypePathsStore({
			// TODO: Remove type once this issue is resolved: https://github.com/gatsbyjs/gatsby/issues/33963
			getCache: gatsbyContext.getCache as (name: string) => gatsby.GatsbyCache,
		});

		const filename = `${md5(JSON.stringify(typePathsExportStore))}.json`;
		const url = gatsby.withAssetPrefix(`/static/${filename}`);

		gatsbyContext.actions.setWebpackConfig({
			plugins: [
				gatsbyContext.plugins.define({
					__GATSBY_PLUGIN_PRISMIC_PREVIEWS_TYPE_PATHS_URL__: `"${url}"`,
				}),
			],
		});
	};
