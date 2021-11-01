const extractFirstSubdomain = (host: string): string => host.split(".")[0];

const parseObjectRef = (previewRef: string): string | undefined => {
	try {
		const parsed = JSON.parse(previewRef);
		const keys = Object.keys(parsed);
		const domainKey = keys.find((key) => /\.prismic\.io$/.test(key));

		return domainKey ? extractFirstSubdomain(domainKey) : undefined;
	} catch {
		return undefined;
	}
};

const parseURLRef = (previewRef: string): string | undefined => {
	try {
		const url = new URL(previewRef);

		return extractFirstSubdomain(url.host);
	} catch {
		return undefined;
	}
};

export const extractPreviewRefRepositoryName = (
	previewRef: string,
): string | undefined => {
	const fromObjectRef = parseObjectRef(previewRef);

	if (fromObjectRef) {
		return fromObjectRef;
	} else {
		return parseURLRef(previewRef);
	}
};
