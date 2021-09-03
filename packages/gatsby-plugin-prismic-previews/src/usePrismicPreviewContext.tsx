import * as React from "react";

import {
	MISSING_PROVIDER_MSG,
	WINDOW_PROVIDER_PRESENCE_KEY,
} from "./constants";
import {
	PrismicContext,
	PrismicContextAction,
	PrismicContextState,
} from "./context";

type UsePrismicPreviewContextValue = readonly [
	PrismicContextState,
	React.Dispatch<PrismicContextAction>,
];

/**
 * Returns the global state for Prismic preview sessions.
 */
export const usePrismicPreviewContext = (): UsePrismicPreviewContextValue => {
	React.useEffect(() => {
		if (
			process.env.NODE_ENV === "development" &&
			!window[WINDOW_PROVIDER_PRESENCE_KEY]
		) {
			console.warn(MISSING_PROVIDER_MSG);
		}
	}, []);

	return React.useContext(PrismicContext);
};
