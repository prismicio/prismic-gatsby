import test from "ava";
import * as prismicM from "@prismicio/mock";
import * as sinon from "sinon";

import { createMockCustomTypeModelWithFields } from "./__testutils__/createMockCustomTypeModelWithFields";

import * as gatsbyPrismic from "../src";

const fixedMatcher = {
	width: sinon.match.number,
	height: sinon.match.number,
	src: sinon.match.string,
	srcSet: sinon.match.string,
	srcWebp: sinon.match.string,
	srcSetWebp: sinon.match.string,
};

const fluidMatcher = {
	aspectRatio: sinon.match.number,
	src: sinon.match.string,
	srcSet: sinon.match.string,
	sizes: sinon.match.string,
	srcWebp: sinon.match.string,
	srcSetWebp: sinon.match.string,
};

const gatsbyImageDataMatcher = {
	images: sinon.match.any,
	layout: sinon.match.string,
	backgroundColor: sinon.match.any,
	width: sinon.match.number,
	height: sinon.match.number,
};

const imageMatcher = {
	fixed: fixedMatcher,
	fluid: fluidMatcher,
	gatsbyImageData: gatsbyImageDataMatcher,
	localFile: {
		childImageSharp: {
			fixed: fixedMatcher,
			fluid: fluidMatcher,
			gatsbyImageData: gatsbyImageDataMatcher,
		},
	},
};

test("normalizes Image fields", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		image: prismicM.model.image({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const url = new URL(document.data.image.url!);
	url.searchParams.set("fit", "max");
	url.searchParams.set("auto", "compress,format");

	t.is(normalizedDocument.data.image.alt, document.data.image.alt);
	t.is(normalizedDocument.data.image.url, decodeURIComponent(url.toString()));
	t.is(normalizedDocument.data.image.copyright, document.data.image.copyright);
	t.is(
		normalizedDocument.data.image.dimensions,
		document.data.image.dimensions,
	);
	t.notThrows(() =>
		sinon.assert.match(
			normalizedDocument.data.image,
			sinon.match(imageMatcher),
		),
	);

	const thumbnailKeys = Object.keys(document.data.image).filter(
		(key) => !["url", "alt", "copyright", "dimensions"].includes(key),
	);
	t.true(thumbnailKeys.length > 0);
	for (const thumbnailKey of thumbnailKeys) {
		t.notThrows(() =>
			sinon.assert.match(
				normalizedDocument.data.image.thumbnails[thumbnailKey],
				sinon.match(imageMatcher),
			),
		);
	}
});

test("normalizes empty Image fields", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		image: prismicM.model.image({ seed: t.title, thumbnailsCount: 0 }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});
	document.data.image.url = null;
	document.data.image.dimensions = null;
	document.data.image.alt = null;
	document.data.image.copyright = null;

	const runtime = gatsbyPrismic.createRuntime();
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	t.is(normalizedDocument.data.image.url, null);
	t.is(normalizedDocument.data.image.dimensions, null);
	t.is(normalizedDocument.data.image.alt, null);
	t.is(normalizedDocument.data.image.copyright, null);
	t.is(normalizedDocument.data.image.fixed, null);
	t.is(normalizedDocument.data.image.fluid, null);
	t.is(normalizedDocument.data.image.gatsbyImageData, null);
	t.is(normalizedDocument.data.image.localFile, null);
	t.deepEqual(normalizedDocument.data.image.thumbnails, {});
});

test("uses imageImgixParams if provided to the runtime", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		image: prismicM.model.image({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});

	const imageImgixParams = {
		q: "100",
		sat: "-100",
	};
	const runtime = gatsbyPrismic.createRuntime({ imageImgixParams });
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const url = new URL(normalizedDocument.data.image.url!);

	t.plan(Object.keys(imageImgixParams).length);
	for (const paramKey in imageImgixParams) {
		t.is(
			url.searchParams.get(paramKey),
			imageImgixParams[paramKey as keyof typeof imageImgixParams],
		);
	}
});

test("uses imagePlaceholderImgixParams if provided to the runtime", (t) => {
	const model = createMockCustomTypeModelWithFields(t, {
		image: prismicM.model.image({ seed: t.title }),
	});
	const document = prismicM.value.document({
		seed: t.title,
		model,
	});

	const imagePlaceholderImgixParams = {
		w: "10",
		q: "20",
	};
	const runtime = gatsbyPrismic.createRuntime({ imagePlaceholderImgixParams });
	runtime.registerCustomTypeModel(model);

	const normalizedDocument = runtime.registerDocument(document);

	const fixedPlaceholderURL = new URL(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		normalizedDocument.data.image.fixed!.base64!,
	);
	const fluidPlaceholderURL = new URL(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		normalizedDocument.data.image.fluid!.base64!,
	);
	// TODO: Test for gatsbyImageData placeholder
	// const gatsbyImageDataPlaceholderURL = new URL(
	//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	//   normalizedDocument.data.image.gatsbyImageData!.placeholder!.fallback!,
	// )

	t.plan(2 * Object.keys(imagePlaceholderImgixParams).length);
	for (const paramKey in imagePlaceholderImgixParams) {
		t.is(
			fixedPlaceholderURL.searchParams.get(paramKey),
			imagePlaceholderImgixParams[
				paramKey as keyof typeof imagePlaceholderImgixParams
			],
		);
		t.is(
			fluidPlaceholderURL.searchParams.get(paramKey),
			imagePlaceholderImgixParams[
				paramKey as keyof typeof imagePlaceholderImgixParams
			],
		);
		// t.is(
		//   gatsbyImageDataPlaceholderURL.searchParams.get(paramKey),
		//   imagePlaceholderImgixParams[
		//     paramKey as keyof typeof imagePlaceholderImgixParams
		//   ],
		// )
	}
});
