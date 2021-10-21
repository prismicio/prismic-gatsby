type CreatePreviewURLArgs = {
	token?: string;
	documentId?: string;
};

export const createPreviewURL = (args: CreatePreviewURLArgs = {}): string => {
	const url = new URL("https://example.com");

	if (args.token) {
		url.searchParams.set("token", args.token);
	}

	if (args.documentId) {
		url.searchParams.set("documentId", args.documentId);
	}

	return url.toString();
};
