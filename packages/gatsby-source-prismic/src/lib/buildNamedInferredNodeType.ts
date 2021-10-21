import * as gatsby from "gatsby";
import * as RTE from "fp-ts/ReaderTaskEither";

import { Dependencies } from "../types";

import { buildObjectType } from "./buildObjectType";

/**
 * Builds a GraphQL object type using Gatsby's Node interface with field
 * inference enabled using the environment's `buildObjectType` function.
 *
 * @param name - Name of type.
 *
 * @returns Return type of the envionrment's `buildObjectType` function.
 */
export const buildNamedInferredNodeType = (
	name: string,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
	buildObjectType({
		name,
		interfaces: ["Node"],
		fields: {},
		extensions: { infer: true },
	});
