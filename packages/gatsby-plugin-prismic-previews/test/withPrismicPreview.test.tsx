// @vitest-environment happy-dom
import { afterEach, describe, expect, test, vi } from "vitest";

import * as prismic from "@prismicio/client";
import * as React from "react";
import { screen, waitFor } from "@testing-library/react";
import { withAssetPrefix } from "gatsby";
import { getImageData } from "gatsby-plugin-image";
import { buildURL as buildImgixURL } from "imgix-url-builder";

import { buildPluginOptions } from "./__testutils__/buildPluginOptions";
import { buildPreviewRef } from "./__testutils__/buildPreviewRef";
import { renderPage } from "./__testutils__/renderPage";
import { setupPreviewEnv } from "./__testutils__/setupPreviewEnv";
import { waitForConsoleError } from "./__testutils__/waitForConsoleError";

import { WithPrismicPreviewProps, withPrismicPreview } from "../src";
import type { PagePropsLike } from "../src/types";
import { usePrismicPreviewStore } from "../src/usePrismicPreviewStore";

vi.mock("gatsby", () => {
	return {
		withAssetPrefix: vi.fn((path: string) => path),
	};
});

beforeAll(() => {
	vi.spyOn(console, "error").mockImplementation(() => {
		// noop
	});
});

afterEach(() => {
	vi.mocked(withAssetPrefix).mockClear();
	vi.mocked(console.error).mockClear();
});

const Page = withPrismicPreview(
	(props: Partial<PagePropsLike & WithPrismicPreviewProps>) => {
		return (
			<div data-testid="page">
				<div data-testid="isPrismicPreview">
					{String(props.isPrismicPreview)}
				</div>
				<div data-testid="data">{JSON.stringify(props.data)}</div>
				<div data-testid="data-link-field-document">
					{JSON.stringify(props.data?.page?.data?.field?.document)}
				</div>
				<div data-testid="originalData">
					{JSON.stringify(props.originalData)}
				</div>
			</div>
		);
	},
);

const waitForDataChange = async () => {
	await waitFor(() => {
		expect(screen.getByTestId("data").textContent).not.toBe(
			screen.getByTestId("originalData").textContent,
		);
	});

	const propData = JSON.parse(screen.getByTestId("data").textContent ?? "null");

	return { propData };
};

test("renders the wrapped component", (ctx) => {
	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		previewType: "inactive",
	});

	renderPage({ Page, repositoryConfigs });

	expect(screen.getByTestId("page")).toBeDefined();
});

test("fetches preview data and merges with static data", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [ctx.mock.value.document({ model: customTypeModels[0] })];
	const data = {
		foo: "bar",
		prismicPage: { _previewable: docs[0].id },
	};

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		customTypeModels,
	});
	renderPage({ Page, repositoryConfigs, data });
	const { propData } = await waitForDataChange();

	expect(propData.prismicPage.prismicId).toBe(docs[0].id);
	expect(propData.prismicPage.__typename).toBe(`PrismicFoo`);
});

test("fetches all documents from a Release", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [
		ctx.mock.model.customType({ id: "foo", fields }),
		ctx.mock.model.customType({ id: "bar", fields }),
	];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0] }),
		ctx.mock.value.document({ model: customTypeModels[1] }),
	];
	const data = {
		first: { _previewable: docs[0].id },
		second: { _previewable: docs[1].id },
		nonExistent: { _previewable: "baz" },
	};

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		customTypeModels,
		previewType: "release",
	});
	renderPage({ Page, repositoryConfigs, data });
	const { propData } = await waitForDataChange();

	expect(propData.first.prismicId).toBe(docs[0].id);
	expect(propData.first.__typename).toBe(`PrismicFoo`);

	expect(propData.second.prismicId).toBe(docs[1].id);
	expect(propData.second.__typename).toBe(`PrismicBar`);

	expect(propData.nonExistent).toStrictEqual(null);
});

test("nullifies deleted documents when previewing a Release", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [ctx.mock.value.document({ model: customTypeModels[0] })];
	const deletedDocs = [ctx.mock.value.document({ model: customTypeModels[0] })];
	const data = {
		notDeleted: { _previewable: docs[0].id },
		deleted: { _previewable: deletedDocs[0].id },
	};

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		deletedDocs,
		customTypeModels,
		previewType: "release",
	});
	renderPage({ Page, repositoryConfigs, data });
	const { propData } = await waitForDataChange();

	expect(propData.notDeleted.prismicId).toBe(docs[0].id);
	expect(propData.notDeleted.__typename).toBe(`PrismicFoo`);

	expect(propData.deleted).toBe(null);
});

test("ignores documents that are missing a model", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [
		ctx.mock.model.customType({ id: "foo", fields }),
		ctx.mock.model.customType({ id: "bar", fields }),
	];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0] }),
		ctx.mock.value.document({ model: customTypeModels[1] }),
	];
	const data = {
		withModel: { _previewable: docs[0].id },
		withoutModel: { _previewable: docs[1].id },
	};

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		// We are purposely only giving a subset of models.
		customTypeModels: [customTypeModels[0]],
	});
	renderPage({ Page, repositoryConfigs, data });
	const { propData } = await waitForDataChange();

	expect(propData.withoutModel).toStrictEqual(data.withoutModel);
});

test("marks the session as bootstrapped on success", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [ctx.mock.value.document({ model: customTypeModels[0] })];
	const data = { prismicPage: { _previewable: docs[0].id } };

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		customTypeModels,
	});
	renderPage({ Page, repositoryConfigs, data });
	await waitForDataChange();

	const state = usePrismicPreviewStore.getState();

	expect(state.isBootstrapped).toBe(true);
});

test("defaults isPrismicPreview prop to null", (ctx) => {
	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		previewType: "inactive",
	});
	renderPage({ Page, repositoryConfigs, static: true });

	expect(screen.queryByTestId("isPrismicPreview")).toHaveTextContent("null");
});

test("sets isPrismicPreview prop to false if a preview is not active", (ctx) => {
	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		previewType: "inactive",
	});
	renderPage({ Page, repositoryConfigs });

	expect(screen.queryByTestId("isPrismicPreview")).toHaveTextContent("false");
});

test("sets isPrismicPreview prop to true if a preview is active", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [ctx.mock.value.document({ model: customTypeModels[0] })];
	const data = {
		foo: "bar",
		prismicPage: { _previewable: docs[0].id },
	};

	const { repositoryConfigs } = setupPreviewEnv({
		ctx,
		docs,
		customTypeModels,
	});
	renderPage({ Page, data, repositoryConfigs });
	await waitForDataChange();

	expect(screen.queryByTestId("isPrismicPreview")).toHaveTextContent("true");
});

test("logs error if plugin options for the repository could not be found", async () => {
	const pluginOptions = buildPluginOptions();
	const ref = buildPreviewRef({ repositoryName: pluginOptions.repositoryName });

	document.cookie = `${prismic.cookie.preview}=${ref};path=/`;

	renderPage({ repositoryConfigs: [], Page });

	await waitForConsoleError();

	expect(console.error).toHaveBeenCalledWith(
		expect.stringMatching(/plugin options could not be found/i),
	);
});

test("logs error if repository configuration for the repository could not be found", async (ctx) => {
	const fields = { uid: ctx.mock.model.uid() };
	const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
	const docs = [
		ctx.mock.value.document({ model: customTypeModels[0], withURL: false }),
	];

	setupPreviewEnv({ ctx, docs });
	renderPage({ repositoryConfigs: [], Page });

	await waitForConsoleError();

	expect(console.error).toHaveBeenCalledWith(
		expect.stringMatching(/repository configuration could not be found/i),
	);
});

describe("environment-specific", () => {
	const originalNodeEnv = process.env.NODE_ENV;

	afterAll(() => {
		process.env.NODE_ENV = originalNodeEnv;
	});

	describe("development", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "development";
		});

		test("labels the wrapped component with withPrismicPreview", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicPreview(Component).displayName).toBe(
				`withPrismicPreview(${Component.displayName})`,
			);
		});
	});

	describe("production", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "production";
		});

		test("does not label the wrapped component with withPrismicPreview", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicPreview(Component).displayName).toBe(undefined);
		});
	});

	describe("test", () => {
		beforeAll(() => {
			process.env.NODE_ENV = "test";
		});

		test("does not label the wrapped component with withPrismicPreview", () => {
			const Component = () => <div />;
			Component.displayName = "Component";

			expect(withPrismicPreview(Component).displayName).toBe(undefined);
		});
	});
});

describe("document normalization", () => {
	test("adds Gatsby-specific base document properties", async (ctx) => {
		const customTypeModels = [ctx.mock.model.customType({ id: "foo" })];
		const doc = ctx.mock.value.document({ model: customTypeModels[0] });
		const data = { page: { _previewable: doc.id } };

		const { repositoryConfigs } = setupPreviewEnv({
			ctx,
			docs: [doc],
			customTypeModels,
			repositoryConfig: {
				htmlSerializer: {
					heading1: ({ children }) => `<h1 data-foo="bar">${children}</h1>`,
				},
			},
		});

		renderPage({ Page, repositoryConfigs, data });
		const { propData } = await waitForDataChange();
		const page = propData.page;

		expect(page.id).toEqual(expect.any(String));
		expect(page.id).not.toBe(doc.id);
		expect(page.url).toBe(
			prismic.asLink(doc, { linkResolver: repositoryConfigs[0].linkResolver }),
		);
		expect(page.__typename).toBe("PrismicFoo");
		expect(page._previewable).toBe(doc.id);
		expect(page.prismicId).toBe(doc.id);
		expect(page.dataRaw).toStrictEqual(doc.data);
		expect(page.raw).toStrictEqual(doc);
	});

	describe("normalizes alternate_languages property", () => {
		test("with filled value", async (ctx) => {
			const customTypeModels = [ctx.mock.model.customType({ id: "foo" })];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			const altLangDoc1 = ctx.mock.value.document({
				model: customTypeModels[0],
			});
			const altLangDoc2 = ctx.mock.value.document({
				model: customTypeModels[0],
			});
			doc.alternate_languages = [
				{
					id: altLangDoc1.id,
					type: altLangDoc1.type,
					lang: altLangDoc1.lang,
					uid: altLangDoc1.uid ?? undefined,
				},
				{
					id: altLangDoc2.id,
					type: altLangDoc2.type,
					lang: altLangDoc2.lang,
					uid: altLangDoc2.uid ?? undefined,
				},
			];
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc, altLangDoc1, altLangDoc2],
				customTypeModels,
				repositoryConfig: {
					linkResolver: (link) => {
						if (link.id === altLangDoc1.id) {
							return `/${altLangDoc1.id}`;
						}
					},
				},
			});
			renderPage({
				Page: withPrismicPreview(
					(props: Partial<PagePropsLike & WithPrismicPreviewProps>) => {
						return (
							<div data-testid="page">
								<div data-testid="isPrismicPreview">
									{String(props.isPrismicPreview)}
								</div>
								<div data-testid="data">{JSON.stringify(props.data)}</div>
								<div data-testid="data-alternate-language-document-1">
									{JSON.stringify(
										props.data?.page?.alternate_languages?.[0]?.document,
									)}
								</div>
								<div data-testid="data-alternate-language-url-1">
									{JSON.stringify(
										props.data?.page?.alternate_languages?.[0]?.url,
									)}
								</div>
								<div data-testid="data-alternate-language-document-2">
									{JSON.stringify(
										props.data?.page?.alternate_languages?.[1]?.document,
									)}
								</div>
								<div data-testid="data-alternate-language-url-2">
									{JSON.stringify(
										props.data?.page?.alternate_languages?.[1]?.url,
									)}
								</div>
								<div data-testid="originalData">
									{JSON.stringify(props.originalData)}
								</div>
							</div>
						);
					},
				),
				repositoryConfigs,
				data,
			});
			await waitForDataChange();

			const alternateLanguageDocument1 = JSON.parse(
				screen.getByTestId("data-alternate-language-document-1").textContent ??
					"null",
			);
			expect(alternateLanguageDocument1.prismicId).toBe(altLangDoc1.id);
			const alternateLanguageURL1 = JSON.parse(
				screen.getByTestId("data-alternate-language-url-1").textContent ??
					"null",
			);
			expect(alternateLanguageURL1).toBe(`/${altLangDoc1.id}`);

			const alternateLanguageDocument2 = JSON.parse(
				screen.getByTestId("data-alternate-language-document-2").textContent ??
					"null",
			);
			expect(alternateLanguageDocument2.prismicId).toBe(altLangDoc2.id);
			const alternateLanguageURL2 = JSON.parse(
				screen.getByTestId("data-alternate-language-url-2").textContent ??
					"null",
			);
			expect(alternateLanguageURL2).toBe(altLangDoc2.url);
		});

		test("with empty value", async (ctx) => {
			const fields = { field: ctx.mock.model.richText() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.richText({
				model: fields.field,
				state: "empty",
			});
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
				repositoryConfig: {
					htmlSerializer: {
						heading1: ({ children }) => `<h1 data-foo="bar">${children}</h1>`,
					},
				},
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.html).toBe(null);
			expect(field.text).toBe(null);
			expect(field.richText).toStrictEqual(doc.data.field);
			expect(field.raw).toStrictEqual(doc.data.field);
		});
	});

	describe("normalizes Rich Text fields", () => {
		test("with filled value", async (ctx) => {
			const fields = { field: ctx.mock.model.richText() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = [{ type: "heading1", text: "Hello world", spans: [] }];
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
				repositoryConfig: {
					htmlSerializer: {
						heading1: ({ children }) => `<h1 data-foo="bar">${children}</h1>`,
					},
				},
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.html).toBe('<h1 data-foo="bar">Hello world</h1>');
			expect(field.text).toBe(prismic.asText(doc.data.field));
			expect(field.richText).toStrictEqual(doc.data.field);
			expect(field.raw).toStrictEqual(doc.data.field);
		});

		test("with empty value", async (ctx) => {
			const fields = { field: ctx.mock.model.richText() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.richText({
				model: fields.field,
				state: "empty",
			});
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
				repositoryConfig: {
					htmlSerializer: {
						heading1: ({ children }) => `<h1 data-foo="bar">${children}</h1>`,
					},
				},
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.html).toBe(null);
			expect(field.text).toBe(null);
			expect(field.richText).toStrictEqual(doc.data.field);
			expect(field.raw).toStrictEqual(doc.data.field);
		});
	});

	describe("normalizes Link fields", () => {
		test("with Web link", async (ctx) => {
			const fields = { field: ctx.mock.model.link() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.link({
				model: fields.field,
				type: "Web",
			});
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.url).toBe(
				prismic.asLink(field, {
					linkResolver: repositoryConfigs[0].linkResolver,
				}),
			);
			expect(field.localFile).toBe(null);
			expect(field.raw).toEqual(doc.data.field);
		});

		test("with Media link", async (ctx) => {
			const fields = { field: ctx.mock.model.link() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.link({
				model: fields.field,
				type: "Media",
			});
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.url).toBe(
				prismic.asLink(field, {
					linkResolver: repositoryConfigs[0].linkResolver,
				}),
			);
			expect(field.localFile).toStrictEqual({
				publicURL: (doc.data.field as prismic.FilledLinkToMediaField).url,
			});
			expect(field.raw).toStrictEqual(doc.data.field);
		});

		test("with Document link", async (ctx) => {
			const fields = { field: ctx.mock.model.link() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			const linkedDoc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.link({
				model: fields.field,
				type: "Document",
				linkableDocuments: [linkedDoc],
			});
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc, linkedDoc],
				customTypeModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.url).toBe(
				prismic.asLink(doc.data.field, {
					linkResolver: repositoryConfigs[0].linkResolver,
				}),
			);
			expect(field.localFile).toBe(null);
			expect(field.raw).toEqual(doc.data.field);

			const fieldDocument = JSON.parse(
				screen.getByTestId("data-link-field-document").textContent ?? "null",
			);
			expect(fieldDocument.prismicId).toBe(linkedDoc.id);
			expect(fieldDocument.__typename).toBe("PrismicFoo");
		});
	});

	describe("normalizes Image fields", () => {
		const buildGatsbyImageData = (field: prismic.ImageFieldImage) => {
			if (prismic.isFilled.imageThumbnail(field)) {
				return getImageData({
					baseUrl: field.url,
					sourceWidth: field.dimensions.width,
					sourceHeight: field.dimensions.height,
					urlBuilder: (args) => {
						return buildImgixURL(args.baseUrl, {
							fit: "max",
							fm:
								args.format && args.format !== "auto" ? args.format : undefined,
							w: args.width,
							h: args.height,
						});
					},
				});
			} else {
				return null;
			}
		};

		test("without thumbnails", async (ctx) => {
			const fields = { field: ctx.mock.model.image() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.image({ model: fields.field });
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.url).toBe(buildImgixURL(doc.data.field.url, { fit: "max" }));
			expect(field.alt).toBe(doc.data.field.alt);
			expect(field.copyright).toBe(doc.data.field.copyright);
			expect(field.dimensions).toStrictEqual(doc.data.field.dimensions);
			expect(field.gatsbyImageData).toEqual(
				buildGatsbyImageData(doc.data.field),
			);
			expect(field.localFile.childImageSharp.gatsbyImageData).toEqual(
				buildGatsbyImageData(doc.data.field),
			);
			expect(field.localFile.publicURL).toBe(doc.data.field.url);
			expect(field.thumbnails).toStrictEqual({});
		});

		test("with thumbnails", async (ctx) => {
			const fields = {
				field: ctx.mock.model.image({
					thumbnailNames: ["foo", "bar", "with-dash"],
				}),
			};
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.image({ model: fields.field });
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const fooURL = buildImgixURL(doc.data.field.foo.url!, { fit: "max" });
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const barURL = buildImgixURL(doc.data.field.bar.url!, { fit: "max" });
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const withDashURL = buildImgixURL(doc.data.field["with-dash"].url!, {
				fit: "max",
			});

			expect(field.thumbnails.foo.url).toBe(fooURL);
			expect(field.thumbnails.foo.alt).toBe(doc.data.field.foo.alt);
			expect(field.thumbnails.foo.copyright).toBe(doc.data.field.foo.copyright);
			expect(field.thumbnails.foo.dimensions).toStrictEqual(
				doc.data.field.foo.dimensions,
			);
			expect(field.thumbnails.foo.gatsbyImageData).toEqual(
				buildGatsbyImageData(doc.data.field.foo),
			);
			expect(
				field.thumbnails.foo.localFile.childImageSharp.gatsbyImageData,
			).toEqual(buildGatsbyImageData(doc.data.field.foo));
			expect(field.thumbnails.foo.localFile.publicURL).toBe(
				doc.data.field.foo.url,
			);

			expect(field.thumbnails.bar.url).toBe(barURL);
			expect(field.thumbnails.bar.alt).toBe(doc.data.field.bar.alt);
			expect(field.thumbnails.bar.copyright).toBe(doc.data.field.bar.copyright);
			expect(field.thumbnails.bar.dimensions).toStrictEqual(
				doc.data.field.bar.dimensions,
			);
			expect(field.thumbnails.bar.gatsbyImageData).toEqual(
				buildGatsbyImageData(doc.data.field.bar),
			);
			expect(
				field.thumbnails.bar.localFile.childImageSharp.gatsbyImageData,
			).toEqual(buildGatsbyImageData(doc.data.field.bar));
			expect(field.thumbnails.bar.localFile.publicURL).toBe(
				doc.data.field.bar.url,
			);

			expect(field.thumbnails.with_dash.url).toBe(withDashURL);
			expect(field.thumbnails.with_dash.alt).toBe(
				doc.data.field["with-dash"].alt,
			);
			expect(field.thumbnails.with_dash.copyright).toBe(
				doc.data.field["with-dash"].copyright,
			);
			expect(field.thumbnails.with_dash.dimensions).toStrictEqual(
				doc.data.field["with-dash"].dimensions,
			);
			expect(field.thumbnails.with_dash.gatsbyImageData).toEqual(
				buildGatsbyImageData(doc.data.field["with-dash"]),
			);
			expect(
				field.thumbnails.with_dash.localFile.childImageSharp.gatsbyImageData,
			).toEqual(buildGatsbyImageData(doc.data.field["with-dash"]));
			expect(field.thumbnails.with_dash.localFile.publicURL).toBe(
				doc.data.field["with-dash"].url,
			);
		});

		test("with empty value", async (ctx) => {
			const fields = { field: ctx.mock.model.image() };
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			doc.data.field = ctx.mock.value.image({
				model: fields.field,
				state: "empty",
			});
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field.url).toBe(null);
			expect(field.alt).toBe(null);
			expect(field.copyright).toBe(null);
			expect(field.dimensions).toBe(null);
			expect(field.gatsbyImageData).toBe(null);
			expect(field.localFile).toBe(null);
			expect(field.thumbnails).toStrictEqual({});
		});
	});

	test("normalizes Group fields", async (ctx) => {
		const fields = {
			field: ctx.mock.model.group({
				fields: { foo: ctx.mock.model.richText() },
			}),
		};
		const customTypeModels = [ctx.mock.model.customType({ id: "foo", fields })];
		const doc = ctx.mock.value.document({ model: customTypeModels[0] });
		const data = { page: { _previewable: doc.id } };

		const { repositoryConfigs } = setupPreviewEnv({
			ctx,
			docs: [doc],
			customTypeModels,
		});
		renderPage({ Page, repositoryConfigs, data });
		const { propData } = await waitForDataChange();
		const { field } = propData.page.data;

		expect(field[0].foo).toHaveProperty("html");
		expect(field[0].foo).toHaveProperty("text");
		expect(field[0].foo).toHaveProperty("richText");
		expect(field[0].foo).toHaveProperty("raw");
	});

	describe("normalizes Slice fields", () => {
		test("with legacy Slices", async (ctx) => {
			const fields = {
				field: ctx.mock.model.sliceZone({
					choices: {
						foo: ctx.mock.model.slice({
							nonRepeatFields: { bar: ctx.mock.model.richText() },
							repeatFields: { baz: ctx.mock.model.richText() },
						}),
					},
				}),
			};
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({ model: customTypeModels[0] });
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field[0].slice_type).toBe(doc.data.field[0]?.slice_type);
			expect(field[0].slice_label).toBe(null);
			expect(field[0].id).toEqual(expect.any(String));

			expect(field[0].primary.bar).toHaveProperty("html");
			expect(field[0].primary.bar).toHaveProperty("text");
			expect(field[0].primary.bar).toHaveProperty("richText");
			expect(field[0].primary.bar).toHaveProperty("raw");

			expect(field[0].items[0].baz).toHaveProperty("html");
			expect(field[0].items[0].baz).toHaveProperty("text");
			expect(field[0].items[0].baz).toHaveProperty("richText");
			expect(field[0].items[0].baz).toHaveProperty("raw");
		});

		test("with Shared Slices", async (ctx) => {
			const fields = {
				field: ctx.mock.model.sliceZone({
					choices: { bar: ctx.mock.model.sharedSliceChoice() },
				}),
			};
			const sharedSliceModels = [
				ctx.mock.model.sharedSlice({
					id: "bar",
					variations: [
						ctx.mock.model.sharedSliceVariation({
							primaryFields: { baz: ctx.mock.model.richText() },
							itemsFields: { qux: ctx.mock.model.richText() },
						}),
					],
				}),
			];
			const customTypeModels = [
				ctx.mock.model.customType({ id: "foo", fields }),
			];
			const doc = ctx.mock.value.document({
				model: customTypeModels[0],
				configs: {
					// @ts-expect-error - @prismicio/mock must make faker an optional property
					sliceZone: { sharedSliceModels },
				},
			});
			const data = { page: { _previewable: doc.id } };

			const { repositoryConfigs } = setupPreviewEnv({
				ctx,
				docs: [doc],
				customTypeModels,
				sharedSliceModels,
			});
			renderPage({ Page, repositoryConfigs, data });
			const { propData } = await waitForDataChange();
			const { field } = propData.page.data;

			expect(field[0].slice_type).toBe(doc.data.field[0]?.slice_type);
			expect(field[0].slice_label).toBe(null);
			expect(field[0].id).toEqual(expect.any(String));

			expect(field[0].primary.baz).toHaveProperty("html");
			expect(field[0].primary.baz).toHaveProperty("text");
			expect(field[0].primary.baz).toHaveProperty("richText");
			expect(field[0].primary.baz).toHaveProperty("raw");

			expect(field[0].items[0].qux).toHaveProperty("html");
			expect(field[0].items[0].qux).toHaveProperty("text");
			expect(field[0].items[0].qux).toHaveProperty("richText");
			expect(field[0].items[0].qux).toHaveProperty("raw");
		});
	});
});
