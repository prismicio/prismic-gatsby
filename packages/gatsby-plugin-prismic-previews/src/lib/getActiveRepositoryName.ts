import { getPreviewCookie } from "./getPreviewCookie";

export const getActiveRepositoryName = (): string | undefined => {
	const [, repositoryName] =
		decodeURIComponent(getPreviewCookie() || "").match(
			/"([a-zA-Z0-9][-a-zA-Z0-9]{2,}[a-zA-Z0-9]).prismic.io"/,
		) || [];

	return repositoryName;
};
