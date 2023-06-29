import type { LinkResolverFunction } from "@prismicio/client";

export const linkResolver: LinkResolverFunction = (link) => {
	return `/${link.uid}`;
};
