import type {
	HTMLRichTextFunctionSerializer,
	HTMLRichTextMapSerializer,
	LinkResolverFunction,
	PrismicDocument,
	Route,
} from "@prismicio/client";
import type { ImgixURLParams } from "imgix-url-builder";

export type PluginOptions = {
	repositoryName: string;
	accessToken?: string;
	apiEndpoint?: string;
	graphQLEndpoint?: string;
	routes?: Route[];
	lang?: string;
	predicates?: string | string[];

	typePrefix?: string;

	imageImgixParams?: ImgixURLParams;
	imagePlaceholderImgixParams?: ImgixURLParams;
} & (
	| {
			fetchLinks?: string[];
			graphQuery?: never;
	  }
	| {
			fetchLinks?: never;
			graphQuery?: string;
	  }
);

// Plugins options for public use in `gatsby-config.js`.
export type PublicPluginOptions = PluginOptions & {
	// `undefined` is included to support process.env values. The plugin's
	// `pluginOptionsSchema` will ensure `repositoryName` contains a string value
	// at runtime.
	repositoryName: PluginOptions["repositoryName"] | undefined;
};

export type RepositoryConfig = {
	/**
	 * Name of the repository to be configured.
	 */
	repositoryName: string;

	/**
	 * Link Resolver for the repository. This should be the same Link Resolver
	 * provided to `gatsby-source-prismic`'s plugin options.
	 */
	linkResolver?: LinkResolverFunction;

	/**
	 * HTML Serializer for the repository. This should be the same HTML Serializer
	 * provided to `gatsby-source-prismic`'s plugin options.
	 */
	htmlSerializer?: HTMLRichTextMapSerializer | HTMLRichTextFunctionSerializer;

	/**
	 * Field name transformer for the repository. This should be the same function
	 * provided to `gatsby-source-prismic`'s `transformFieldName` plugin option.
	 *
	 * @param fieldName - Field name to transform.
	 *
	 * @returns Transformed version of `fieldName`.
	 */
	transformFieldName?: (fieldName: string) => string;

	/**
	 * Determines the React component to render during an unpublished preview.
	 * This function will be provided a list of nodes whose `url` field (computed
	 * using your app's Link Resolver) matches the page's URL.
	 *
	 * @param nodes - List of nodes whose `url` field matches the page's URL.
	 *
	 * @returns The React component to render. If no component is returned, the
	 *   wrapped component will be rendered.
	 */
	componentResolver?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
	| Record<string, React.ComponentType<any>>
		| ((
				nodes: unknown[],
		  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
		  React.ComponentType<any> | undefined | null);

	/**
	 * Determines the data passed to a Gatsby page during an unpublished preview.
	 * The value returned from this function is passed directly to the `data`
	 * prop.
	 *
	 * @param nodes - List of nodes that have URLs resolved to the current page.
	 * @param data - The original page's `data` prop.
	 *
	 * @returns The value that will be passed to the page's `data` prop.
	 */
	dataResolver?<TData extends Record<string, unknown>>(
		nodes: unknown,
		data: TData,
	): Record<string, unknown>;
};

export type NormalizedDocument = PrismicDocument & {
	__typename: string;
	_previewable: string;
	prismicId: string;
	dataRaw: PrismicDocument["data"];
	raw: PrismicDocument;
	data: unknown;
};

export type PagePropsLike = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: Record<string, any>;
	location?: {
		pathname?: string;
	};
};
