import * as prismicT from "@prismicio/types";

export const getMasterRef = (
	repositoryResponse: prismicT.Repository,
): string => {
	const masterRef = repositoryResponse.refs.find((ref) => ref.isMasterRef);

	if (!masterRef) {
		throw new Error("Could not find master ref");
	}

	return masterRef.ref;
};
