import type { FetchLike } from "@prismicio/custom-types-client";
import type { GatsbyCache } from "gatsby";
import type { Response } from "node-fetch";

type CachedFetchArgs = {
	fetch: FetchLike;
	cache: GatsbyCache;
	name: string;
};

export const cachedFetch = async (
	input: Parameters<FetchLike>[0],
	init: Parameters<FetchLike>[1],
	args: CachedFetchArgs,
): Promise<Response> => {
	const cacheKey = `fetchLike(${args.name})___${JSON.stringify({
		input,
		init,
	})}`;

	const cachedValue: string | undefined = await args.cache.get(cacheKey);

	const { Response } = await import("node-fetch");

	// Gatsby's cache does not have a `has` method. Because we are
	// saving strings to the cache, this check should be sufficient
	// to detect cache values.
	if (cachedValue !== undefined) {
		return new Response(cachedValue);
	} else {
		const result = await args.fetch(input, init);

		// Using `.text()` allows the consumer to re-parse as
		// JSON while being able to save to the cache reliably.
		const text = await result.text();

		// This call is purposely not awaited. We can let it
		// resolve in the background.
		args.cache.set(cacheKey, text);

		return new Response(text);
	}
};
