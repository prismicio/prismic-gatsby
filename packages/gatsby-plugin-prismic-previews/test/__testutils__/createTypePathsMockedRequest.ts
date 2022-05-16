import * as msw from "msw";
import * as gatsbyPrismic from "gatsby-source-prismic";

import { resolveURL } from "./resolveURL";

export const createTypePathsMockedRequest = (
	repositoryName: string,
	typePaths: gatsbyPrismic.SerializedTypePath[],
): msw.RestHandler =>
	msw.rest.get(
		resolveURL(
			globalThis.__PATH_PREFIX__,
			`/static/type-paths___${repositoryName}.json`,
		),
		(_req, res, ctx) => res(ctx.json(typePaths)),
	);
