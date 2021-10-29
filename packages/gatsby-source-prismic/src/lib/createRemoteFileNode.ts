import * as prismicT from "@prismicio/types";
import * as gatsbyFs from "gatsby-source-filesystem";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { Dependencies } from "../types";
import { shouldDownloadFile } from "./shouldDownloadFile";
import { getFromOrSetToCache } from "./getFromOrSetToCache";

type CreateRemoteFileNodeConfig = {
	url: string;
	field: prismicT.ImageFieldImage | prismicT.LinkToMediaField;
	path: string[];
};

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
	config: CreateRemoteFileNodeConfig,
): RTE.ReaderTaskEither<Dependencies, Error, gatsbyFs.FileSystemNode | null> =>
	pipe(
		RTE.ask<Dependencies>(),
		RTE.bind("attemptDownload", () =>
			shouldDownloadFile({
				path: config.path,
				field: config.field,
			}),
		),
		RTE.chain((scope) =>
			getFromOrSetToCache(
				`file-node-${config.url}`,
				RTE.fromTaskEither(
					TE.tryCatch(
						() =>
							scope.attemptDownload
								? scope.createRemoteFileNode({
										url: config.url,
										store: scope.store,
										cache: scope.cache,
										createNode: scope.createNode,
										createNodeId: scope.createNodeId,
										reporter: scope.reporter,
								  })
								: Promise.resolve(null),
						(e) => e as Error,
					),
				),
			),
		),
	);
