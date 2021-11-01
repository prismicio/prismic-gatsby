import * as React from "react";
import * as gatsbyPrismic from "gatsby-source-prismic";

import { isPlainObject } from "./lib/isPlainObject";
import { isProxy } from "./lib/isProxy";

import { UnknownRecord } from "./types";
import { StateKind } from "./context";
import { usePrismicPreviewContext } from "./usePrismicPreviewContext";

/**
 * Recursively finds previewable data and replaces data if a previewed version
 * of it exists in the provided nodes.
 *
 * @param nodes - List of Prismic document nodes.
 *
 * @returns Function that accepts a node or node content to find and replace
 *   previewable content.
 */
const findAndReplacePreviewables = (
	runtime: gatsbyPrismic.Runtime,
	nodeOrLeaf: unknown,
): unknown => {
	if (isPlainObject(nodeOrLeaf)) {
		// If the value is a proxy, we can't reliably replace properties since
		// property keys could be synthetic. We opt to ignore the object
		// completely.
		//
		// At the time of writing this comment, Proxies are only present in Link
		// fields. We can safely opt out of merging preview data in this case.
		if (isProxy(nodeOrLeaf)) {
			return nodeOrLeaf;
		}

		const nodeId = nodeOrLeaf[gatsbyPrismic.PREVIEWABLE_NODE_ID_FIELD] as
			| string
			| undefined;
		if (nodeId && runtime.hasNode(nodeId)) {
			return runtime.getNode(nodeId);
		}

		// We didn't find a previewable field, so continue to iterate through all
		// properties to find it.
		const newNode = {} as typeof nodeOrLeaf;
		for (const key in nodeOrLeaf) {
			newNode[key] = findAndReplacePreviewables(runtime, nodeOrLeaf[key]);
		}

		return newNode;
	}

	// Iterate all elements in the node to find the previewable value.
	if (Array.isArray(nodeOrLeaf)) {
		return (nodeOrLeaf as unknown[]).map((subnode) =>
			findAndReplacePreviewables(runtime, subnode),
		);
	}

	// If the node is not an object or array, it cannot be a previewable value.
	return nodeOrLeaf;
};

/**
 * Takes a static data object and a record of nodes and replaces any instances
 * of those nodes in the static data with the updated version. The replacement
 * is done recursively to ensure nested nodes are replaced.
 *
 * Nodes are considered matches if they have identical
 * `PREVIEWABLE_NODE_ID_FIELD` fields (see constant value in `src/constants.ts`).
 *
 * @param staticData - Static data object in which nodes will be replaced.
 * @param nodes - List of nodes that replace in `staticData`.
 *
 * @returns `staticData` with any matching nodes replaced with nodes in `nodes`.
 */
const traverseAndReplace = <TStaticData extends UnknownRecord>(
	staticData: TStaticData,
	runtime: gatsbyPrismic.Runtime,
): { data: TStaticData; isPreview: boolean } => {
	if (runtime.nodes.length > 0) {
		return {
			data: findAndReplacePreviewables(runtime, staticData) as TStaticData,
			isPreview: true,
		};
	} else {
		return {
			data: staticData,
			isPreview: false,
		};
	}
};

export type UsePrismicPreviewDataConfig = {
	/**
	 * Determines if merging should be skipped.
	 */
	skip?: boolean;
};

export type UsePrismicPreviewDataResult<TStaticData extends UnknownRecord> = {
	/**
	 * Data with previewed content merged if matching documents are found.
	 */
	data: TStaticData;

	/**
	 * Boolean determining if `data` contains previewed data.
	 */
	isPreview: boolean;
};

/**
 * Merges static Prismic data with previewed data during a Prismic preview
 * session. If the static data finds previewable Prismic data (identified by the
 * `_previewable` field in a Prismic document), this hook will replace its value
 * with one from the preview session.
 *
 * The static data could come from page queries or `useStaticQuery` within a component.
 *
 * @param staticData - Static data from Gatsby's GraphQL layer.
 * @param config - Configuration that determines how the hook merges preview data.
 *
 * @returns An object containing the merged data and a boolean determining if
 *   the merged data contains preview data.
 */
export const useMergePrismicPreviewData = <TStaticData extends UnknownRecord>(
	staticData: TStaticData,
	config: UsePrismicPreviewDataConfig = { skip: false },
): UsePrismicPreviewDataResult<TStaticData> => {
	const [state] = usePrismicPreviewContext();

	return React.useMemo(() => {
		const runtime = state.activeRepositoryName
			? state.runtimeStore[state.activeRepositoryName]
			: undefined;

		if (!config.skip && runtime && state.state === StateKind.Bootstrapped) {
			return traverseAndReplace(staticData, runtime);
		} else {
			return { data: staticData, isPreview: false };
		}
	}, [staticData, config.skip, state]);
};
