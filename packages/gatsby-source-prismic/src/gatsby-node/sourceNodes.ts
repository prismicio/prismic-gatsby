import {
	CustomTypeModel,
	LinkResolverFunction,
	PrismicDocument,
	Release,
	SharedSliceModel,
	WebhookBody,
	WebhookType,
	createClient,
} from "@prismicio/client";
import type { Node, SourceNodesArgs } from "gatsby";

import { cachedFetch } from "../lib/cachedFetch";
import { createDocumentNodes } from "../lib/createDocumentNodes";
import { fmtLog } from "../lib/fmtLog";
import { getModelsCacheKey } from "../lib/getModelsCacheKey";
import { hasOwnProperty } from "../lib/hasOwnProperty";

import type { PluginOptions } from "../types";

const isPrismicWebhookBody = (
	webhookBody: unknown,
): webhookBody is WebhookBody => {
	return (
		typeof webhookBody === "object" &&
		webhookBody !== null &&
		hasOwnProperty(webhookBody, "apiUrl") &&
		typeof webhookBody.apiUrl === "string" &&
		/^https?:\/\/([^.]+)\.(wroom\.(?:test|io)|prismic\.io)\/api\/?/.test(
			webhookBody.apiUrl,
		)
	);
};

export const sourceNodes = async <
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TLinkResolverFunction extends LinkResolverFunction<any> = LinkResolverFunction,
>(
	args: SourceNodesArgs,
	options: PluginOptions<TLinkResolverFunction>,
): Promise<void> => {
	const client = createClient(options.apiEndpoint || options.repositoryName, {
		accessToken: options.accessToken,
		routes: options.routes,
		fetch: async (input, init) => {
			const resolvedFetch =
				options.fetch || (await import("node-fetch")).default;
			const url = new URL(input);

			if (/\/documents\/search\/?/.test(url.pathname)) {
				return await cachedFetch(input, init, {
					fetch: resolvedFetch,
					cache: args.cache,
					name: "sourceNodes",
				});
			} else {
				return await resolvedFetch(input, init);
			}
		},
		defaultParams: {
			lang: options.lang || "*",
			fetchLinks: options.fetchLinks,
			graphQuery: options.graphQuery,
			predicates: options.predicates,
		},
	});

	let release: Release | undefined;
	if (options.releaseID) {
		client.queryContentFromReleaseByID(options.releaseID);
		release = await client.getReleaseByID(options.releaseID);
	} else if (options.releaseLabel) {
		client.queryContentFromReleaseByLabel(options.releaseLabel);
		release = await client.getReleaseByLabel(options.releaseLabel);
	}

	// Only log Release information at startup.
	if (release && !args.webhookBody) {
		args.reporter.info(
			fmtLog(
				options.repositoryName,
				`Querying documents from the "${release.label}" Release (ID: "${release.id}")`,
			),
		);
	}

	const {
		customTypeModels,
		sharedSliceModels,
	}: {
		customTypeModels: CustomTypeModel[];
		sharedSliceModels: SharedSliceModel[];
	} = await args.cache.get(
		getModelsCacheKey({ repositoryName: options.repositoryName }),
	);

	let documentsToCreate: PrismicDocument[] = [];
	const documentIDsToDelete: string[] = [];

	const hasWebhookBody =
		args.webhookBody && JSON.stringify(args.webhookBody) !== "{}";

	if (!hasWebhookBody) {
		documentsToCreate = await client.dangerouslyGetAll();
	} else {
		if (
			isPrismicWebhookBody(args.webhookBody) &&
			args.webhookBody.domain === options.repositoryName
		) {
			if (
				!args.webhookBody.secret ||
				args.webhookBody.secret === options.webhookSecret
			) {
				switch (args.webhookBody.type) {
					case WebhookType.TestTrigger: {
						args.reporter.info(
							fmtLog(
								options.repositoryName,
								"Success! Received a test trigger webhook. When changes to your content are saved, Gatsby will automatically fetch the changes.",
							),
						);

						break;
					}

					case WebhookType.APIUpdate: {
						args.reporter.info(
							fmtLog(
								options.repositoryName,
								"Received an API update webhook. Documents will be added, updated, or deleted accordingly.",
							),
						);

						const webhookDocumentIDs = args.webhookBody.documents;

						if (release) {
							const webhookReleaseDocumentIDs: string[] = [];
							for (const releaseUpdate of [
								...(args.webhookBody.releases.update || []),
								...(args.webhookBody.releases.addition || []),
								...(args.webhookBody.releases.deletion || []),
							]) {
								if (releaseUpdate.id === release.id) {
									webhookReleaseDocumentIDs.push(...releaseUpdate.documents);
								}
							}

							webhookDocumentIDs.push(...webhookReleaseDocumentIDs);
						}

						documentsToCreate = await client.getAllByIDs([
							...new Set(webhookDocumentIDs),
						]);

						for (const webhookDocumentID of webhookDocumentIDs) {
							if (
								!documentsToCreate.some((doc) => doc.id === webhookDocumentID)
							) {
								documentIDsToDelete.push(webhookDocumentID);
							}
						}

						break;
					}
				}
			}
		}
	}

	if (documentsToCreate.length > 0) {
		if (hasWebhookBody) {
			args.reporter.info(
				fmtLog(
					options.repositoryName,
					`Adding or updating the following Prismic documents: [${documentsToCreate
						.map((doc) => `"${doc.id}"`)
						.join(", ")}]`,
				),
			);
		}

		await createDocumentNodes({
			documents: documentsToCreate,
			customTypeModels,
			sharedSliceModels,
			gatsbyNodeArgs: args,
			pluginOptions: options,
		});
	}

	if (documentIDsToDelete.length > 0) {
		args.reporter.info(
			fmtLog(
				options.repositoryName,
				`Deleting the following Prismic documents: [${documentIDsToDelete
					.map((id) => `"${id}"`)
					.join(", ")}]`,
			),
		);

		for (const documentIDToDelete of documentIDsToDelete) {
			const node = args.getNode(args.createNodeId(documentIDToDelete));

			if (node) {
				args.actions.deleteNode(node);
			}
		}
	}

	// All nodes must be touched to prevent them from being garbage collected.
	const nodesToTouch: Node[] = args.getNodes().filter((node) => {
		return (
			node.internal.owner === "gatsby-source-prismic" &&
			hasOwnProperty(node, "prismicId") &&
			typeof node.prismicId === "string" &&
			!documentIDsToDelete.includes(node.prismicId)
		);
	});

	for (const nodeToTouch of nodesToTouch) {
		args.actions.touchNode(nodeToTouch);
	}
};
