import * as React from "react";

import { getDocument } from "./lib/getDocument";
import { hasOwnProperty } from "./lib/hasOwnProperty";

import { usePrismicPreviewStore } from "./usePrismicPreviewStore";

type MergePreviewDataArgs<TStaticDataNode> = {
	staticDataNode: TStaticDataNode;
	publishedDocumentIDs: string[];
};

const mergePreviewData = <TStaticDataNode>({
	staticDataNode,
	publishedDocumentIDs,
}: MergePreviewDataArgs<TStaticDataNode>): TStaticDataNode => {
	const castedData: unknown = staticDataNode;

	if (
		typeof castedData === "object" &&
		castedData !== null &&
		!Array.isArray(castedData)
	) {
		if (hasOwnProperty(castedData, "_previewable")) {
			const replacement = getDocument(castedData._previewable as string);

			if (replacement) {
				return replacement as unknown as typeof staticDataNode;
			} else {
				if (
					publishedDocumentIDs.length > 0 &&
					!publishedDocumentIDs.includes(castedData._previewable as string)
				) {
					return null as unknown as typeof staticDataNode;
				} else {
					return staticDataNode;
				}
			}
		} else {
			const newNode = {} as TStaticDataNode;

			for (const key in castedData) {
				newNode[key as keyof typeof newNode] = mergePreviewData({
					staticDataNode: castedData[key as keyof typeof castedData],
					publishedDocumentIDs,
				});
			}

			return newNode;
		}
	} else if (Array.isArray(staticDataNode)) {
		return staticDataNode.map((element) => {
			return mergePreviewData({
				staticDataNode: element,
				publishedDocumentIDs,
			});
		}) as typeof staticDataNode;
	} else {
		return staticDataNode;
	}
};

export const useMergePrismicPreviewData = <
	TStaticData extends Record<string, unknown>,
>(
	staticData: TStaticData | undefined,
): TStaticData | undefined => {
	const isBootstrapped = usePrismicPreviewStore(
		(state) => state.isBootstrapped,
	);
	const publishedDocumentIDs = usePrismicPreviewStore(
		(state) => state.publishedDocumentIDs,
	);
	const documents = usePrismicPreviewStore((state) => state.documents);

	return React.useMemo(() => {
		if (staticData) {
			const hasPreviewData =
				publishedDocumentIDs.length > 0 || Object.keys(documents).length > 0;

			if (isBootstrapped && hasPreviewData) {
				return mergePreviewData({
					staticDataNode: staticData,
					publishedDocumentIDs,
				});
			} else {
				return staticData;
			}
		}
	}, [documents, publishedDocumentIDs, isBootstrapped, staticData]);
};
