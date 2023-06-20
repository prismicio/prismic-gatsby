import { Client, PrismicDocument, filter } from "@prismicio/client";

import { isReleasePreview } from "./isReleasePreview";

type FetchNewDocumentsArgs = {
	client: Client;
	abortController: AbortController;
};

export const fetchNewDocuments = async ({
	client,
	abortController,
}: FetchNewDocumentsArgs): Promise<PrismicDocument[]> => {
	const signal = abortController.signal;

	const first = await client.getFirst({ signal });

	if (isReleasePreview()) {
		const rest = await client.dangerouslyGetAll({
			predicates: [
				filter.dateBetween(
					"document.last_publication_date",
					Date.parse(first.last_publication_date),
					Date.parse(first.last_publication_date) + 1000,
				),
				filter.not("document.id", first.id),
			],
			signal,
		});

		return [first, ...rest];
	} else {
		return [first];
	}
};
