import * as gatsby from "gatsby";
import * as gqlc from "graphql-compose";
import * as RTE from "fp-ts/ReaderTaskEither";

import { Dependencies } from "../types";

/**
 * Builds a GraphQL scalar type using the environment's `buildScalarType` function.
 *
 * @param config - Configuration for the scalar type.
 *
 * @returns Return value of the environment's `buildScalarType` function.
 */
export const buildScalarType = (
	config: gqlc.ScalarTypeComposerAsObjectDefinition,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLScalarType> =>
	RTE.asks((deps) => deps.buildScalarType(config));
