import * as O from "fp-ts/Option";

const extractFirstSubdomain = (host: string): O.Option<string> =>
	O.fromNullable(host.split(".")[0]);

const parseObjectRef = (previewRef: string): O.Option<string> => {
	try {
		const parsed = JSON.parse(previewRef);
		const keys = Object.keys(parsed);
		const domainKey = keys.find((key) => /\.prismic\.io$/.test(key));

		return domainKey ? extractFirstSubdomain(domainKey) : O.none;
	} catch {
		return O.none;
	}
};

const parseURLRef = (previewRef: string): O.Option<string> => {
	try {
		const url = new URL(previewRef);

		return extractFirstSubdomain(url.host);
	} catch {
		return O.none;
	}
};

export const extractPreviewRefRepositoryName = (
	previewRef: string,
): O.Option<string> => {
	const fromObjectRef = parseObjectRef(previewRef);
	if (O.isSome(fromObjectRef)) {
		return fromObjectRef;
	} else {
		return parseURLRef(previewRef);
	}
};
