import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

export const getURLSearchParam = (key: string): O.Option<string> =>
	pipe(
		new URLSearchParams(window.location.search),
		(params) => params.get(key),
		O.fromNullable,
	);
