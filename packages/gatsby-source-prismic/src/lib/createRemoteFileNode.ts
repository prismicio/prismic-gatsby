import * as gatsby from "gatsby";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { Dependencies } from "../types";

/**
 * Creates a File node with remote data using the environment's
 * `createRemoteFileNode` function. The contents of the provided URL are
 * attached to the node's data.
 *
 * @param url - URL from which data is fetched.
 *
 * @returns The created File node.
 */
export const createRemoteFileNode = (
	url: string,
): RTE.ReaderTaskEither<Dependencies, Error, gatsby.Node> =>
	pipe(
		RTE.ask<Dependencies>(),
		RTE.chainW((deps) =>
			RTE.fromTaskEither(
				TE.tryCatch(
					() =>
						deps.createRemoteFileNode({
							url,
							store: deps.store,
							cache: deps.cache,
							createNode: deps.createNode,
							createNodeId: deps.createNodeId,
							reporter: deps.reporter,
						}),
					(e) => e as Error,
				),
			),
		),
	);
