import { TestContext, expect } from "vitest";

import * as prismic from "@prismicio/client";
import {
	FieldNode,
	IntValueNode,
	OperationDefinitionNode,
	StringValueNode,
	parse as parseGraphQL,
} from "graphql";
import { graphql, rest } from "msw";

import { buildPluginOptions } from "./buildPluginOptions";
import { buildPreviewRef } from "./buildPreviewRef";
import { createMSWQueryHandler } from "./createMSWQueryHandler";
import { createMSWRepositoryHandler } from "./createMSWRepositoryHandler";

import { RepositoryConfig } from "../../src";
import { onClientEntry } from "../../src/gatsby-browser";
import { PluginOptions as ValidatedPluginOptions } from "../../src/types";

type CreateMSWPreviewResolverQueryHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	ref: string;
	doc: prismic.PrismicDocument;
};

const createMSWPreviewResolverQueryHandler = (
	args: CreateMSWPreviewResolverQueryHandlerArgs,
) => {
	return createMSWQueryHandler({
		ctx: args.ctx,
		pluginOptions: args.pluginOptions,
		response: args.ctx.mock.api.query({ documents: [args.doc] }),
		validator: (req) => {
			expect(req.url.searchParams.get("lang")).toBe("*");
			expect(req.url.searchParams.get("pageSize")).toBe("1");
			expect(req.url.searchParams.getAll("q")).toStrictEqual([
				`[${prismic.predicate.at("document.id", args.doc.id)}]`,
			]);
			expect(req.url.searchParams.get("ref")).toBe(args.ref);
		},
	});
};

type CreateMSWFirstDocumentQueryHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	ref: string;
	doc: prismic.PrismicDocument;
};

const createMSWFirstDocumentQueryHandler = (
	args: CreateMSWFirstDocumentQueryHandlerArgs,
) => {
	return createMSWQueryHandler({
		ctx: args.ctx,
		pluginOptions: args.pluginOptions,
		response: args.ctx.mock.api.query({ documents: [args.doc] }),
		validator: (req) => {
			expect(req.url.searchParams.get("lang")).toBe("*");
			expect(req.url.searchParams.get("pageSize")).toBe("1");
			expect(req.url.searchParams.getAll("q")).toStrictEqual([]);
			expect(req.url.searchParams.get("ref")).toBe(args.ref);
		},
	});
};

type CreateMSWDeletedDocumentsGraphQLQueryHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	ref: string;
	docs: prismic.PrismicDocument[];
};

const createMSWDeletedDocumentsGraphQLQueryHandler = (
	args: CreateMSWDeletedDocumentsGraphQLQueryHandlerArgs,
) => {
	return graphql.query("AllDocumentIDs", (req, res, ctx) => {
		const rawQuery = req.url.searchParams.get("query") || "";
		const query = parseGraphQL(rawQuery);
		const allDocumentsField = (query.definitions[0] as OperationDefinitionNode)
			.selectionSet.selections[0] as FieldNode;

		const firstArg = allDocumentsField.arguments?.find(
			(arg) => arg.name.value === "first",
		)?.value as IntValueNode;
		const firstArgValue = Number.parseInt(firstArg.value);

		const afterArg = allDocumentsField.arguments?.find(
			(arg) => arg.name.value === "after",
		)?.value as StringValueNode | undefined;
		const afterArgValue = afterArg?.value;

		const afterIndex =
			args.docs.findIndex((doc) => doc.id === afterArgValue) + 1;

		const docs = args.docs.slice(afterIndex, afterIndex + firstArgValue);

		return res(
			ctx.data({
				_allDocuments: {
					pageInfo: {
						endCursor: docs[docs.length - 1].id,
						hasNextPage: afterIndex + docs.length < args.docs.length,
					},
					edges: docs.map((doc) => {
						return {
							node: {
								_meta: {
									id: doc.id,
								},
							},
						};
					}),
				},
			}),
		);
	});
};

type CreateMSWReleaseDocumentsQueryHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	ref: string;
	docs: prismic.PrismicDocument[];
};

const createMSWReleaseDocumentsQueryHandler = (
	args: CreateMSWReleaseDocumentsQueryHandlerArgs,
) => {
	return createMSWQueryHandler({
		ctx: args.ctx,
		pluginOptions: args.pluginOptions,
		response: args.ctx.mock.api.query({ documents: args.docs }),
		validator: (req) => {
			expect(req.url.searchParams.get("lang")).toBe("*");
			expect(req.url.searchParams.get("pageSize")).toBe("100");
			expect(req.url.searchParams.getAll("q")).toStrictEqual([
				`[${prismic.predicate.dateBetween(
					"document.last_publication_date",
					Date.parse(args.docs[0].last_publication_date),
					Date.parse(args.docs[0].last_publication_date) + 1000,
				)}]`,
				`[${prismic.predicate.not("document.id", args.docs[0].id)}]`,
			]);
			expect(req.url.searchParams.get("ref")).toBe(args.ref);
		},
	});
};

type CreateMSWLinkedDocumentsQueryHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	ref: string;
	docs: prismic.PrismicDocument[];
};

const createMSWLinkedDocumentsQueryHandler = (
	args: CreateMSWLinkedDocumentsQueryHandlerArgs,
) => {
	return createMSWQueryHandler({
		ctx: args.ctx,
		pluginOptions: args.pluginOptions,
		validator: (req) => {
			expect(req.url.searchParams.get("lang")).toBe("*");
			expect(req.url.searchParams.get("pageSize")).toBe("100");
			expect(req.url.searchParams.getAll("q")).toStrictEqual([
				expect.stringMatching(/in\(document\.id,/),
			]);
			expect(req.url.searchParams.get("ref")).toBe(args.ref);
		},
		response: (req) => {
			const ids = [
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				...req.url.searchParams.get("q")!.matchAll(/"(\w+)"/g),
			].map((group) => group[1]);

			return args.ctx.mock.api.query({
				documents: args.docs.filter((doc) => ids.includes(doc.id)),
			});
		},
	});
};

type CreateMSWModelsHandlerArgs = {
	ctx: TestContext;
	pluginOptions: ValidatedPluginOptions;
	customTypeModels?: prismic.CustomTypeModel[];
	sharedSliceModels?: prismic.SharedSliceModel[];
};

const createMSWModelsHandler = (args: CreateMSWModelsHandlerArgs) => {
	return rest.get(__PUBLIC_MODELS_PATH__, (_req, res, ctx) => {
		return res(
			ctx.json({
				[args.pluginOptions.repositoryName]: {
					customTypeModels: args.customTypeModels || [],
					sharedSliceModels: args.sharedSliceModels || [],
				},
			}),
		);
	});
};

export type SetupPreviewEnvArgs = {
	ctx: TestContext;
	deletedDocs?: prismic.PrismicDocument[];
	customTypeModels?: prismic.CustomTypeModel[];
	sharedSliceModels?: prismic.SharedSliceModel[];
	repositoryConfig?: Partial<RepositoryConfig>;
} & (
	| { previewType?: "resolver"; docs: prismic.PrismicDocument[] }
	| { previewType?: "document"; docs: prismic.PrismicDocument[] }
	| { previewType: "release"; docs: prismic.PrismicDocument[] }
	| { previewType: "inactive"; docs?: never }
);

type SetupPreviewEnvReturnType = {
	repositoryConfigs: RepositoryConfig[];
};

export const setupPreviewEnv = (
	args: SetupPreviewEnvArgs,
): SetupPreviewEnvReturnType => {
	const pluginOptions = buildPluginOptions();
	const repositoryConfig: RepositoryConfig = {
		repositoryName: pluginOptions.repositoryName,
		linkResolver: (doc) => `/${doc.uid}`,
		...args.repositoryConfig,
	};

	const repositoryConfigs: RepositoryConfig[] = [repositoryConfig];

	if (
		!args.previewType ||
		args.previewType === "resolver" ||
		args.previewType === "document" ||
		args.previewType === "release"
	) {
		const ref = buildPreviewRef({
			repositoryName: pluginOptions.repositoryName,
			isRelease: args.previewType === "release",
		});

		const locationURL = new URL("https://example.com");

		if (args.previewType === "resolver") {
			locationURL.pathname = "/preview";
			locationURL.searchParams.set("documentId", args.docs[0].id);
			locationURL.searchParams.set("token", "previewToken");
		} else {
			if (args.docs) {
				locationURL.pathname =
					prismic.asLink(args.docs[0], {
						linkResolver: repositoryConfig.linkResolver,
					}) || "";
			}
		}

		window.location.href = locationURL.href;

		document.cookie = `${prismic.cookie.preview}=${ref}`;

		args.ctx.server.use(
			createMSWRepositoryHandler({
				ctx: args.ctx,
				pluginOptions,
			}),
			createMSWPreviewResolverQueryHandler({
				ctx: args.ctx,
				pluginOptions,
				ref: "previewToken",
				doc: args.docs[0],
			}),
			createMSWFirstDocumentQueryHandler({
				ctx: args.ctx,
				pluginOptions,
				ref,
				doc: args.docs[0],
			}),
			createMSWLinkedDocumentsQueryHandler({
				ctx: args.ctx,
				pluginOptions,
				ref,
				docs: args.docs,
			}),
			createMSWModelsHandler({
				ctx: args.ctx,
				pluginOptions,
				customTypeModels: args.customTypeModels,
				sharedSliceModels: args.sharedSliceModels,
			}),
		);

		if (args.previewType === "release") {
			args.ctx.server.use(
				createMSWDeletedDocumentsGraphQLQueryHandler({
					ctx: args.ctx,
					pluginOptions,
					ref,
					docs: args.docs,
				}),
				createMSWReleaseDocumentsQueryHandler({
					ctx: args.ctx,
					pluginOptions,
					ref,
					docs: args.docs,
				}),
			);
		}
	}

	onClientEntry(args.ctx.browserPluginArgs, pluginOptions);

	return { repositoryConfigs };
};
