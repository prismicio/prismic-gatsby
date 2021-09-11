import * as gatsby from "gatsby";
import * as gatsbyImgix from "gatsby-plugin-imgix-lite/node";
import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/function";

import { Dependencies } from "../types";

/**
 * Builds a list of Imgix GraphQL types used by Image Custom Type fields. The
 * resulting types can be created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildImgixImageTypes: RTE.ReaderTaskEither<
	Dependencies,
	never,
	gatsby.GatsbyGraphQLType[]
> = pipe(
	RTE.ask<Dependencies>(),
	RTE.map((scope) => [
		gatsbyImgix.buildFixedObjectType({
			namespace: "Imgix",
			cache: scope.cache,
			schema: scope.schema,
		}),
		gatsbyImgix.buildFluidObjectType({
			namespace: "Imgix",
			cache: scope.cache,
			schema: scope.schema,
		}),
		gatsbyImgix.buildImgixParamsInputObjectType({
			namespace: "Imgix",
			schema: scope.schema,
		}),
		gatsbyImgix.buildGatsbyImageDataPlaceholderEnum({
			namespace: "Imgix",
			schema: scope.schema,
		}),
	]),
);
