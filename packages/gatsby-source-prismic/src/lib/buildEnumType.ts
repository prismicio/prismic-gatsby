import * as gatsby from "gatsby";
import * as gqlc from "graphql-compose";
import * as RTE from "fp-ts/ReaderTaskEither";

import { Dependencies } from "../types";

/**
 * Builds a GraphQL enum type using the environment's `buildEnumType` function.
 *
 * @param config - Configuration for the enum type.
 *
 * @returns Return value of the environment's `buildEnumType` function.
 */
export const buildEnumType = (
	config: gqlc.EnumTypeComposerAsObjectDefinition,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLEnumType> =>
	RTE.asks((deps) => deps.buildEnumType(config));
