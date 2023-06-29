import type { NormalizedDocument } from "../types";

import { usePrismicPreviewStore } from "../usePrismicPreviewStore";

export const getDocument = (
	prismicId: string,
): NormalizedDocument | undefined => {
	const state = usePrismicPreviewStore.getState();

	return state.documents[prismicId];
};
