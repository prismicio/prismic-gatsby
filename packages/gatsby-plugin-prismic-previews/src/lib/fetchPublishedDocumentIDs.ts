import { Client, getGraphQLEndpoint } from "@prismicio/client";

import { PluginOptions } from "../types";

import { isReleasePreview } from "./isReleasePreview";

type FetchPublishedDocumentIDsGraphQLResult = {
	data: {
		_allDocuments: {
			pageInfo: {
				endCursor: string;
				hasNextPage: boolean;
			};
			edges: {
				node: {
					_meta: {
						id: string;
					};
				};
			}[];
		};
	};
};

type FetchPublishedDocumentIDsArgs = {
	client: Client;
	abortController: AbortController;
	pluginOptions: PluginOptions;
};

export const fetchPublishedDocumentIDs = async ({
	client,
	abortController,
	pluginOptions,
}: FetchPublishedDocumentIDsArgs): Promise<string[]> => {
	if (isReleasePreview()) {
		const endpoint =
			pluginOptions.graphQLEndpoint ||
			getGraphQLEndpoint(pluginOptions.repositoryName);

		const existingIDs: string[] = [];

		let after: string | undefined;
		let hasNextPage = false;
		do {
			const url = new URL(endpoint);
			const afterStr = after ? `,after:"${after}"` : "";
			url.searchParams.set(
				"query",
				`query AllDocumentIDs{_allDocuments(first:100${afterStr}){pageInfo{endCursor,hasNextPage}edges{node{_meta{id}}}}}`,
			);

			const res = await client.graphQLFetch(url.toString(), {
				signal: abortController.signal,
			});
			const json: FetchPublishedDocumentIDsGraphQLResult = await res.json();

			for (let i = 0; i < json.data._allDocuments.edges.length; i++) {
				existingIDs.push(json.data._allDocuments.edges[i].node._meta.id);
			}

			after = json.data._allDocuments.pageInfo.endCursor;
			hasNextPage = json.data._allDocuments.pageInfo.hasNextPage;
		} while (hasNextPage);

		return existingIDs;
	} else {
		return [];
	}
};
