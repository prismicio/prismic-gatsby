import { afterAll, afterEach, beforeAll, expect, test, vi } from "vitest";

import { rest } from "msw";
import { setupServer } from "msw/node";

import { buildPluginOptionsForTest } from "./__testutils__/buildPluginOptionsForTest";
import { createMockCreateSchemaCustomizationGatsbyNodePluginArgs as createGatsbyNodeArgs } from "./__testutils__/createMockGatsbyNodePluginArgs";
import { findCreateTypesCall } from "./__testutils__/findCreateTypesCall";

import { createSchemaCustomization } from "../src/gatsby-node";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("document contains correct field type", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					image: ctx.mock.model.image(),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicFooData",
			fields: {
				image: {
					type: "PrismicImageField",
					description: expect.any(String),
				},
			},
		},
	});
});

test("creates field-specific image type for fields with thumbnails", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [
			ctx.mock.model.customType({
				id: "foo",
				fields: {
					bar: ctx.mock.model.image({
						thumbnailNames: ["Mobile", "Tablet", "With-Dashes"],
					}),
				},
			}),
		],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooData",
			fields: {
				bar: {
					type: "PrismicFooDataBarImageField",
					description: expect.any(String),
				},
			},
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooDataBarImageField",
			fields: expect.objectContaining({
				thumbnails: {
					type: "PrismicFooDataBarImageFieldThumbnails!",
					description: expect.any(String),
					resolve: expect.any(Function),
				},
			}),
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicFooDataBarImageFieldThumbnails",
			fields: expect.objectContaining({
				Mobile: {
					type: "PrismicImageField",
				},
				Tablet: {
					type: "PrismicImageField",
				},
				With_Dashes: {
					type: "PrismicImageField",
				},
			}),
		}),
	});
});

test("thumbnail field resolves thumbnails", async (ctx) => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const customTypeModel = ctx.mock.model.customType({
		id: "foo",
		fields: {
			bar: ctx.mock.model.image({
				thumbnailNames: ["Mobile"],
			}),
		},
	});
	const pluginOptions = buildPluginOptionsForTest({
		customTypeModels: [customTypeModel],
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(
		createTypesSpy,
		"PrismicFooDataBarImageField",
	);
	const resolver = type.config.fields.thumbnails.resolve;
	const field = ctx.mock.value.image({
		model: customTypeModel.json.Main.bar,
	});
	const res = resolver(field);

	expect(res).toBe(field);
});

test("image url is correctly encoded", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.url.resolve;

	expect(
		resolver(
			{
				url: "https://example.com/image%402x%20with%20spaces+and+plus+signs+&.png",
			},
			{},
		),
	).toBe(
		"https://example.com/image%402x%20with%20spaces+and+plus+signs+&.png?fit=max",
	);

	expect(
		resolver(
			{
				url: "https://example.com/image@2x with spaces and plus signs &.png",
			},
			{},
		),
	).toBe(
		"https://example.com/image@2x%20with%20spaces%20and%20plus%20signs%20&.png?fit=max",
	);
});

test("creates shared type", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicImageFieldDimensions",
			description: expect.any(String),
			fields: {
				width: {
					type: "Int!",
					description: expect.any(String),
				},
				height: {
					type: "Int!",
					description: expect.any(String),
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "ENUM",
		config: {
			name: "PrismicGatsbyImageDataPlaceholder",
			description: expect.any(String),
			values: {
				BLURRED: {
					value: "blurred",
					description: expect.any(String),
				},
				DOMINANT_COLOR: {
					value: "dominantColor",
					description: expect.any(String),
				},
				NONE: {
					value: "none",
					description: expect.any(String),
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "INTERFACE",
		config: {
			name: "PrismicImageFieldBase",
			description: expect.any(String),
			fields: {
				alt: {
					type: "String",
					description: expect.any(String),
				},
				copyright: {
					type: "String",
					description: expect.any(String),
				},
				dimensions: {
					type: "PrismicImageFieldDimensions",
					description: expect.any(String),
				},
				url: {
					type: "String",
					description: expect.any(String),
				},
				gatsbyImageData: {
					type: "JSON",
					description: expect.any(String),
				},
				localFile: {
					type: "File",
					description: expect.any(String),
					extensions: { link: {} },
				},
			},
		},
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: {
			name: "PrismicImageField",
			description: expect.any(String),
			fields: {
				alt: {
					type: "String",
					description: expect.any(String),
				},
				copyright: {
					type: "String",
					description: expect.any(String),
				},
				dimensions: {
					type: "PrismicImageFieldDimensions",
					description: expect.any(String),
				},
				url: {
					type: "String",
					description: expect.any(String),
					args: {
						imgixParams: {
							type: "PrismicImgixURLParams",
							description: expect.any(String),
						},
					},
					resolve: expect.any(Function),
				},
				gatsbyImageData: {
					type: "JSON",
					args: expect.objectContaining({}),
					resolve: expect.any(Function),
				},
				localFile: {
					type: "File",
					description: expect.any(String),
					extensions: { link: {} },
				},
			},
			interfaces: ["PrismicImageFieldBase"],
		},
	});
});

test("supports configurable type prefix", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		typePrefix: "prefix",
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicImageFieldDimensions",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "ENUM",
		config: expect.objectContaining({
			name: "PrismicGatsbyImageDataPlaceholder",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "INTERFACE",
		config: expect.objectContaining({
			name: "PrismicImageFieldBase",
		}),
	});

	expect(createTypesSpy).toHaveBeenCalledWith({
		kind: "OBJECT",
		config: expect.objectContaining({
			name: "PrismicPrefixImageField",
		}),
	});
});

test("url field supports custom default Imgix params", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		imageImgixParams: {
			sat: -100,
		},
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.url.resolve;

	expect(
		resolver(
			{
				url: "https://example.com/image.png",
			},
			{},
		),
	).toBe("https://example.com/image.png?fit=max&sat=-100");
});

test("url field supports argument Imgix params", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		imageImgixParams: {
			sat: -100,
		},
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.url.resolve;

	expect(
		resolver(
			{
				url: "https://example.com/image.png",
			},
			{
				imgixParams: {
					blur: 50,
				},
			},
		),
	).toBe("https://example.com/image.png?fit=max&sat=-100&blur=50");
});

test("url field argument Imgix params overrides defaults", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		imageImgixParams: {
			sat: -100,
		},
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.url.resolve;

	expect(
		resolver(
			{
				url: "https://example.com/image.png",
			},
			{
				imgixParams: {
					sat: 50,
				},
			},
		),
	).toBe("https://example.com/image.png?fit=max&sat=50");
});

test("gatsbyImageData field supports custom default Imgix params", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		imageImgixParams: {
			sat: -100,
		},
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		height: 300,
		images: {
			fallback: {
				sizes: "(min-width: 400px) 400px, 100vw",
				src: "https://example.com/image.png?fit=max&sat=-100&w=400&h=300",
				srcSet:
					"https://example.com/image.png?fit=max&sat=-100&w=100&h=75 100w,\n" +
					"https://example.com/image.png?fit=max&sat=-100&w=200&h=150 200w,\n" +
					"https://example.com/image.png?fit=max&sat=-100&w=400&h=300 400w",
			},
			sources: [
				{
					sizes: "(min-width: 400px) 400px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&sat=-100&w=100&h=75&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&sat=-100&w=200&h=150&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&sat=-100&w=400&h=300&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
		width: 400,
	});
});

test("gatsbyImageData field supports argument Imgix params", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		imageImgixParams: {
			sat: -100,
		},
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			imgixParams: {
				blur: 50,
			},
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		height: 300,
		images: {
			fallback: {
				sizes: "(min-width: 400px) 400px, 100vw",
				src: "https://example.com/image.png?fit=max&sat=-100&blur=50&w=400&h=300",
				srcSet:
					"https://example.com/image.png?fit=max&sat=-100&blur=50&w=100&h=75 100w,\n" +
					"https://example.com/image.png?fit=max&sat=-100&blur=50&w=200&h=150 200w,\n" +
					"https://example.com/image.png?fit=max&sat=-100&blur=50&w=400&h=300 400w",
			},
			sources: [
				{
					sizes: "(min-width: 400px) 400px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&sat=-100&blur=50&w=100&h=75&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&sat=-100&blur=50&w=200&h=150&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&sat=-100&blur=50&w=400&h=300&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
		width: 400,
	});
});

test("gatsbyImageData field argument Imgix params overrides defaults", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest({
		imageImgixParams: {
			sat: -100,
		},
	});
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			imgixParams: {
				sat: 50,
			},
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		height: 300,
		images: {
			fallback: {
				sizes: "(min-width: 400px) 400px, 100vw",
				src: "https://example.com/image.png?fit=max&sat=50&w=400&h=300",
				srcSet:
					"https://example.com/image.png?fit=max&sat=50&w=100&h=75 100w,\n" +
					"https://example.com/image.png?fit=max&sat=50&w=200&h=150 200w,\n" +
					"https://example.com/image.png?fit=max&sat=50&w=400&h=300 400w",
			},
			sources: [
				{
					sizes: "(min-width: 400px) 400px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&sat=50&w=100&h=75&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&sat=50&w=200&h=150&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&sat=50&w=400&h=300&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
		width: 400,
	});
});

test("gatsbyImageData field supports FIXED layout with given width and height params", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			layout: "fixed",
			width: 200,
			height: 100,
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		width: 200,
		height: 100,
		images: {
			fallback: {
				sizes: "200px",
				src: "https://example.com/image.png?fit=max&w=200&h=100",
				srcSet:
					"https://example.com/image.png?fit=max&w=200&h=100 200w,\n" +
					"https://example.com/image.png?fit=max&w=400&h=200 400w",
			},
			sources: [
				{
					sizes: "200px",
					srcSet:
						"https://example.com/image.png?fit=max&w=200&h=100&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&w=400&h=200&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "fixed",
	});
});

test("gatsbyImageData field supports aspectRatio option", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			aspectRatio: "2",
			width: 200,
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		width: 200,
		height: 100,
		images: {
			fallback: {
				sizes: "(min-width: 200px) 200px, 100vw",
				src: "https://example.com/image.png?fit=max&w=200&h=100",
				srcSet:
					"https://example.com/image.png?fit=max&w=50&h=25 50w,\n" +
					"https://example.com/image.png?fit=max&w=100&h=50 100w,\n" +
					"https://example.com/image.png?fit=max&w=200&h=100 200w,\n" +
					"https://example.com/image.png?fit=max&w=400&h=200 400w",
			},
			sources: [
				{
					sizes: "(min-width: 200px) 200px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&w=50&h=25&fm=webp 50w,\n" +
						"https://example.com/image.png?fit=max&w=100&h=50&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&w=200&h=100&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&w=400&h=200&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
	});
});

test("gatsbyImageData field supports backgroundColor option", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			backgroundColor: "#f0f",
		},
	);

	expect(res).toMatchObject({
		backgroundColor: "#f0f",
		width: 400,
		height: 300,
		images: {
			fallback: {
				sizes: "(min-width: 400px) 400px, 100vw",
				src: "https://example.com/image.png?fit=max&w=400&h=300",
				srcSet:
					"https://example.com/image.png?fit=max&w=100&h=75 100w,\n" +
					"https://example.com/image.png?fit=max&w=200&h=150 200w,\n" +
					"https://example.com/image.png?fit=max&w=400&h=300 400w",
			},
			sources: [
				{
					sizes: "(min-width: 400px) 400px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&w=100&h=75&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&w=200&h=150&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&w=400&h=300&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
	});
});

test("gatsbyImageData field supports breakpoints option", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			breakpoints: [50, 100],
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		width: 400,
		height: 300,
		images: {
			fallback: {
				sizes: "(min-width: 400px) 400px, 100vw",
				src: "https://example.com/image.png?fit=max&w=400&h=300",
				srcSet:
					"https://example.com/image.png?fit=max&w=50&h=38 50w,\n" +
					"https://example.com/image.png?fit=max&w=100&h=75 100w,\n" +
					"https://example.com/image.png?fit=max&w=400&h=300 400w",
			},
			sources: [
				{
					sizes: "(min-width: 400px) 400px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&w=50&h=38&fm=webp 50w,\n" +
						"https://example.com/image.png?fit=max&w=100&h=75&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&w=400&h=300&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
	});
});

test("gatsbyImageData field supports formats option", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			formats: ["AVIF", "WEBP", "JPG"],
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		width: 400,
		height: 300,
		images: {
			fallback: {
				sizes: "(min-width: 400px) 400px, 100vw",
				src: "https://example.com/image.png?fit=max&w=400&h=300&fm=jpg",
				srcSet:
					"https://example.com/image.png?fit=max&w=100&h=75&fm=jpg 100w,\n" +
					"https://example.com/image.png?fit=max&w=200&h=150&fm=jpg 200w,\n" +
					"https://example.com/image.png?fit=max&w=400&h=300&fm=jpg 400w",
			},
			sources: [
				{
					sizes: "(min-width: 400px) 400px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&w=100&h=75&fm=avif 100w,\n" +
						"https://example.com/image.png?fit=max&w=200&h=150&fm=avif 200w,\n" +
						"https://example.com/image.png?fit=max&w=400&h=300&fm=avif 400w",
					type: "image/avif",
				},
				{
					sizes: "(min-width: 400px) 400px, 100vw",
					srcSet:
						"https://example.com/image.png?fit=max&w=100&h=75&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&w=200&h=150&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&w=400&h=300&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
	});
});

test("gatsbyImageData field supports sizes option", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;
	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			sizes: "(max-height: 500px) 1000px",
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
		width: 400,
		height: 300,
		images: {
			fallback: {
				sizes: "(max-height: 500px) 1000px",
				src: "https://example.com/image.png?fit=max&w=400&h=300",
				srcSet:
					"https://example.com/image.png?fit=max&w=100&h=75 100w,\n" +
					"https://example.com/image.png?fit=max&w=200&h=150 200w,\n" +
					"https://example.com/image.png?fit=max&w=400&h=300 400w",
			},
			sources: [
				{
					sizes: "(max-height: 500px) 1000px",
					srcSet:
						"https://example.com/image.png?fit=max&w=100&h=75&fm=webp 100w,\n" +
						"https://example.com/image.png?fit=max&w=200&h=150&fm=webp 200w,\n" +
						"https://example.com/image.png?fit=max&w=400&h=300&fm=webp 400w",
					type: "image/webp",
				},
			],
		},
		layout: "constrained",
	});
});

test("gatsbyImageData DominantColor placeholder fetches color from Imgix", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;

	server.use(
		rest.get("https://example.com/image.png", (req, res, ctx) => {
			if (
				req.url.toString() ===
				"https://example.com/image.png?fit=max&palette=json&colors=1"
			) {
				return res(
					ctx.json({
						dominant_colors: {
							vibrant: {
								hex: "#ff00ff",
							},
						},
					}),
				);
			}
		}),
	);

	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			placeholder: "dominantColor",
		},
	);

	expect(res).toMatchObject({
		backgroundColor: "#ff00ff",
	});
});

test("gatsbyImageData DominantColor placeholder is ignored for SVGs", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;

	const res = await resolver(
		{
			url: "https://example.com/image.svg",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			placeholder: "dominantColor",
		},
	);

	expect(res).toMatchObject({
		backgroundColor: undefined,
	});
});

test("gatsbyImageData Blurred placeholder fetches image from Imgix", async () => {
	const gatsbyNodeArgs = createGatsbyNodeArgs();
	const pluginOptions = buildPluginOptionsForTest();
	const createTypesSpy = vi.spyOn(gatsbyNodeArgs.actions, "createTypes");

	await createSchemaCustomization(gatsbyNodeArgs, pluginOptions);

	const type = findCreateTypesCall(createTypesSpy, "PrismicImageField");
	const resolver = type.config.fields.gatsbyImageData.resolve;

	server.use(
		rest.get("https://example.com/image.png", (req, res, ctx) => {
			if (
				req.url.toString() === "https://example.com/image.png?fit=max&w=20&h=15"
			) {
				return res(ctx.json({ message: "this would be a blob normally" }));
			}
		}),
	);

	const res = await resolver(
		{
			url: "https://example.com/image.png",
			dimensions: {
				width: 400,
				height: 300,
			},
		},
		{
			placeholder: "blurred",
		},
	);

	expect(res).toMatchObject({
		placeholder: {
			fallback:
				// This would not be JSON in practice. We're
				// just using JSON here because it's easier to generate
				// in a test.
				"data:application/json;base64,eyJtZXNzYWdlIjoidGhpcyB3b3VsZCBiZSBhIGJsb2Igbm9ybWFsbHkifQ==",
		},
	});
});
