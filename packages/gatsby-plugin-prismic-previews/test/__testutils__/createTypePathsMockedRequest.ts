import * as msw from "msw";
import * as gatsbyPrismic from "gatsby-source-prismic";

import { resolveURL } from "./resolveURL";

export const createTypePathsMockedRequest = (
	filename: string,
	typePaths: gatsbyPrismic.SerializedTypePath[],
): msw.RestHandler =>
	msw.rest.get(
		resolveURL(globalThis.__PATH_PREFIX__, `/static/${filename}`),
		(_req, res, ctx) => res(ctx.json(typePaths)),
	);
