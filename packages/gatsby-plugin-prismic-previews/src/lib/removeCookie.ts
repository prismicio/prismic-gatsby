import * as cookie from "es-cookie";
import * as IO from "fp-ts/IO";

export const removeCookie =
	(name: string): IO.IO<void> =>
	() =>
		cookie.remove(name);
