import * as O from "fp-ts/Option";

export const getURLSearchParam = (key: string): O.Option<string> => {
	const params = new URLSearchParams(window.location.search);

	return O.fromNullable(params.get(key));
};
