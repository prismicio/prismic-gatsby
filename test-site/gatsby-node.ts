import { CreatePagesArgs } from "gatsby";

export const createPages = async (args: CreatePagesArgs) => {
	args.actions.createRedirect({
		fromPath: "/admin",
		toPath: `https://gatsby-source-prismic-v4.prismic.io`,
		redirectInBrowser: true,
	});
};
