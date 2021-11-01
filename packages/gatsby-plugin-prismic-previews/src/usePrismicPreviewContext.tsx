import * as React from "react";

import {
	MISSING_PROVIDER_MSG,
	WINDOW_PROVIDER_PRESENCE_KEY,
} from "./constants";
import { PrismicContext, PrismicContextType } from "./context";

/**
 * Returns the global state for Prismic preview sessions.
 */
export const usePrismicPreviewContext = (): PrismicContextType => {
	React.useEffect(() => {
		// Warn the user if `<PrismicPreviewProvider>` was not added to
		// the tree. `<PrismicPreviewProvider>` sets a value on window
		// to track if it was mounted.
		if (
			process.env.NODE_ENV === "development" &&
			!window[WINDOW_PROVIDER_PRESENCE_KEY]
		) {
			console.warn(MISSING_PROVIDER_MSG);
		}
	}, []);

	return React.useContext(PrismicContext);
};
