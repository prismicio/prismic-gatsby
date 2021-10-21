import * as RTE from "fp-ts/ReaderTaskEither";
import { constVoid, pipe } from "fp-ts/function";

import { createNodeOfType } from "./createNodeOfType";

import { Dependencies, SerializedTypePath } from "../types";

/**
 * Creates a type path using the environment's `createTypePath` function.
 *
 * @param path - Path to the field.
 * @param type - Type of the field.
 */
export const createTypePath = (
	serializedTypePath: SerializedTypePath,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
	pipe(
		RTE.right({
			id: serializedTypePath.path,
			kind: serializedTypePath.kind,
			path: serializedTypePath.path,
			type: serializedTypePath.type,
		}),
		RTE.chain((node) => createNodeOfType(node, "TypePathType")),
		RTE.map(constVoid),
	);
