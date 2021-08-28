import * as gatsby from "gatsby";
import * as RTE from "fp-ts/ReaderTaskEither";

import { Dependencies } from "../types";

/**
 * Registers a type using the environment's `createTypes` function.
 *
 * @param type - GraphQL type to create.
 */
export const createType = <A extends gatsby.GatsbyGraphQLType>(
	type: A,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
	RTE.asks((deps) => deps.createTypes(type));
