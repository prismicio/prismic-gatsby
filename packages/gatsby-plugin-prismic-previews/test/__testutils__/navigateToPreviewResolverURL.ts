import { createPreviewURL } from "./createPreviewURL";

export const navigateToPreviewResolverURL = (
	token: string,
	documentId: string | null = "documentId",
): void =>
	window.history.replaceState(
		null,
		"",
		createPreviewURL({ token, documentId: documentId ?? undefined }),
	);
