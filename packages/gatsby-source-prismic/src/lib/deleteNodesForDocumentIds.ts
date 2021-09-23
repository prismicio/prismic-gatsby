import * as RTE from "fp-ts/ReaderTaskEither";
import * as A from "fp-ts/Array";
import { pipe, constVoid } from "fp-ts/function";

import { Dependencies, Mutable } from "../types";

import { getNodes } from "./getNodes";
import { deleteNodes } from "./deleteNodes";

/**
 * Deletes nodes for a given set of Prismic document IDs. Note that these are
 * Prismic document IDs, not Gatsby Node IDs.
 *
 * @param documentIds - List of Prismic document IDs used to find nodes to delete.
 */
export const deleteNodesForDocumentIds = (
	documentIds: string[],
): RTE.ReaderTaskEither<Dependencies, never, void> =>
	pipe(
		RTE.ask<Dependencies>(),
		RTE.chain((deps) =>
			pipe(
				documentIds,
				A.map(deps.nodeHelpers.createNodeId),
				getNodes,
				RTE.map((nodes) =>
					pipe(
						nodes as Mutable<typeof nodes>,
						A.filter((node): node is NonNullable<typeof node> => node != null),
					),
				),
				RTE.chain((nodes) => deleteNodes(nodes)),
				RTE.map(constVoid),
			),
		),
	);
