import * as gatsby from "gatsby";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import { pipe, constVoid } from "fp-ts/function";

import { createAllDocumentTypesType } from "./lib/createAllDocumentTypesType";
import { createCustomType } from "./lib/createCustomType";
import { createSharedSlice } from "./lib/createSharedSlice";
import { createTypes } from "./lib/createTypes";
import { preparePluginOptions } from "./lib/preparePluginOptions";
import { throwError } from "./lib/throwError";

import { buildAlternateLanguageType } from "./builders/buildAlternateLanguageType";
import { buildEmbedType } from "./builders/buildEmbedType";
import { buildGeoPointType } from "./builders/buildGeoPointType";
import { buildImageDimensionsType } from "./builders/buildImageDimensionsType";
import { buildImageThumbnailType } from "./builders/buildImageThumbnailType";
import { buildImgixImageTypes } from "./builders/buildImgixImageTypes";
import { buildLinkType } from "./builders/buildLinkType";
import { buildLinkTypeEnumType } from "./builders/buildLinkTypeEnumType";
import { buildSharedSliceInterface } from "./builders/buildSharedSliceInterface";
import { buildSliceInterface } from "./builders/buildSliceInterface";
import { buildStructuredTextType } from "./builders/buildStructuredTextType";

import { Dependencies, Mutable, UnpreparedPluginOptions } from "./types";
import { buildDependencies } from "./buildDependencies";
import { getFromCache } from "./lib/getFromCache";
import { setToCache } from "./lib/setToCache";
import { TYPE_PATHS_EXPORTS_CACHE_KEY } from "./constants";

const GatsbyGraphQLTypeM = A.getMonoid<gatsby.GatsbyGraphQLType>();

/**
 * Create general types used by other types. Some types are global (i.e. not
 * repository-specific), while others are repository-specific, depending on the
 * type's use of custom plugin options.
 */
export const createBaseTypes: RTE.ReaderTaskEither<Dependencies, never, void> =
	pipe(
		RTE.ask<Dependencies>(),
		RTE.bind("baseTypes", () =>
			pipe(
				[
					buildAlternateLanguageType,
					buildEmbedType,
					buildGeoPointType,
					buildImageDimensionsType,
					buildImageThumbnailType,
					buildLinkType,
					buildLinkTypeEnumType,
					buildSliceInterface,
					buildSharedSliceInterface,
					buildStructuredTextType,
				],
				RTE.sequenceArray,
			),
		),
		RTE.bind("imgixTypes", () => buildImgixImageTypes),
		RTE.map((scope) =>
			GatsbyGraphQLTypeM.concat(
				scope.baseTypes as Mutable<typeof scope.baseTypes>,
				scope.imgixTypes,
			),
		),
		RTE.chain(createTypes),
		RTE.map(constVoid),
	);

/**
 * Create types for all Custom Types using the JSON models provided at
 * `pluginOptions.customTypeModels`.
 */
const createCustomTypes: RTE.ReaderTaskEither<
	Dependencies,
	Error,
	gatsby.GatsbyGraphQLObjectType[]
> = pipe(
	RTE.asks((deps: Dependencies) => deps.pluginOptions.customTypeModels),
	RTE.map(A.map(createCustomType)),
	RTE.chain(RTE.sequenceArray),
	RTE.map((types) => types as Mutable<typeof types>),
);

/**
 * Create types for all Shared Slices using the JSON models provided at
 * `pluginOptions.sharedSliceModels`.
 */
const createSharedSlices: RTE.ReaderTaskEither<
	Dependencies,
	Error,
	gatsby.GatsbyGraphQLUnionType[]
> = pipe(
	RTE.asks((deps: Dependencies) => deps.pluginOptions.sharedSliceModels),
	RTE.map(A.map(createSharedSlice)),
	RTE.chain(RTE.sequenceArray),
	RTE.map((types) => types as Mutable<typeof types>),
);

const cacheTypePaths: RTE.ReaderTaskEither<Dependencies, Error, void> = pipe(
	RTE.ask<Dependencies>(),
	RTE.chainFirst((scope) =>
		RTE.right(
			scope.runtime.registerCustomTypeModels(
				scope.pluginOptions.customTypeModels,
			),
		),
	),
	RTE.chainFirst((scope) =>
		RTE.right(
			scope.runtime.registerSharedSliceModels(
				scope.pluginOptions.sharedSliceModels,
			),
		),
	),
	RTE.bind("typePathsExport", (scope) =>
		RTE.right(scope.runtime.exportTypePaths()),
	),
	RTE.bind("cachedTypePaths", () =>
		pipe(
			getFromCache<Record<string, string>>(TYPE_PATHS_EXPORTS_CACHE_KEY),
			RTE.orElse(() => RTE.right({} as Record<string, string>)),
		),
	),
	RTE.chainFirst((scope) =>
		pipe(
			{
				...scope.cachedTypePaths,
				[scope.pluginOptions.repositoryName]: scope.typePathsExport,
			},
			setToCache(TYPE_PATHS_EXPORTS_CACHE_KEY),
		),
	),
	RTE.map(constVoid),
);

/**
 * To be executed in the `createSchemaCustomization` API.
 */
const createSchemaCustomizationProgram: RTE.ReaderTaskEither<
	Dependencies,
	Error,
	void
> = pipe(
	RTE.ask<Dependencies>(),
	RTE.chainFirst(() => createBaseTypes),
	RTE.chainFirst(() => createSharedSlices),
	RTE.bind("customTypeTypes", () => createCustomTypes),
	RTE.chainFirstW((scope) => createAllDocumentTypesType(scope.customTypeTypes)),
	RTE.chainFirst(() => cacheTypePaths),
	RTE.map(constVoid),
);

/**
 * Create all GraphQL types for the plugin's configured Prismic repository.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createSchemaCustomization
 */
export const createSchemaCustomization: NonNullable<
	gatsby.GatsbyNode["createSchemaCustomization"]
> = async (
	gatsbyContext: gatsby.CreateSchemaCustomizationArgs,
	unpreparedPluginOptions: UnpreparedPluginOptions,
) => {
	const pluginOptions = await preparePluginOptions(unpreparedPluginOptions);
	const dependencies = await buildDependencies(gatsbyContext, pluginOptions);

	return await pipe(
		createSchemaCustomizationProgram(dependencies),
		TE.fold(throwError, () => T.of(void 0)),
	)();
};
