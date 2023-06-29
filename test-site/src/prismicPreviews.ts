import * as React from "react";
import type { RepositoryConfig } from "gatsby-plugin-prismic-previews";

import { linkResolver } from "./linkResolver";

export const repositoryConfigs: RepositoryConfig[] = [
	{
		repositoryName: "gatsby-source-prismic-v4",
		linkResolver,
		componentResolver: {
			kitchen_sink: React.lazy(
				() => import("./pages/{PrismicKitchenSink.url}"),
			),
		},
	},
];
