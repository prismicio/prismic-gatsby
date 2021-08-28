import * as gatsby from "gatsby";
import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe, constVoid } from "fp-ts/function";

import { setPrismicWindowEndpoint } from "./lib/setPrismicWindowEndpoint";
import { setPluginOptionsOnWindow } from "./lib/setPluginOptionsOnWindow";

import { PluginOptions } from "./types";
import { sprintf } from "./lib/sprintf";
import { MISSING_STYLES_MSG } from "./constants";

interface OnClientEntryProgramEnv {
	pluginOptions: PluginOptions;
}

/**
 * Sets up the app for the legacy toolbar which requires configuration to be set
 * on `window`.
 */
export const setupLegacyToolbar: RTE.ReaderTaskEither<
	OnClientEntryProgramEnv,
	Error,
	void
> = pipe(
	RTE.ask<OnClientEntryProgramEnv>(),
	RTE.chainW(
		RTE.fromPredicate(
			(env) => env.pluginOptions.toolbar === "legacy",
			() =>
				new Error(
					"Only repositories using the legacy toolbar must call this API.",
				),
		),
	),
	RTE.chainFirst((env) =>
		RTE.fromIO(setPrismicWindowEndpoint(env.pluginOptions.apiEndpoint)),
	),
	RTE.map(constVoid),
	// We don't care if this fails.
	RTE.orElse(() => RTE.right(void 0 as void)),
);

/**
 * Sets the plugin's options on a window using a predefined identifier.
 */
export const setWindowPluginOptions: RTE.ReaderTaskEither<
	OnClientEntryProgramEnv,
	Error,
	void
> = pipe(
	RTE.ask<OnClientEntryProgramEnv>(),
	RTE.chainW(
		RTE.fromPredicate(
			() => typeof window !== "undefined",
			() => new Error("Window plugin options do not need to be set in SSR"),
		),
	),
	RTE.chainFirst((env) =>
		RTE.fromIO(setPluginOptionsOnWindow(env.pluginOptions)),
	),
	RTE.map(constVoid),
	// We don't care if this fails.
	RTE.orElse(() => RTE.right(void 0 as void)),
);

/**
 * Sets the plugin's options on a window using a predefined identifier.
 */
export const checkStyles = (
	stylesheetName: string,
): RTE.ReaderTaskEither<OnClientEntryProgramEnv, Error, void> =>
	process.env.NODE_ENV === "development" && typeof window !== "undefined"
		? pipe(
				RTE.Do,
				RTE.chain(
					RTE.fromPredicate(
						() =>
							parseInt(
								window
									.getComputedStyle(document.body)
									.getPropertyValue(`--${stylesheetName}`),
							) !== 1,
						() => new Error("Styles are correctly setup"),
					),
				),
				RTE.chainFirst(() =>
					RTE.fromIO(() =>
						console.warn(sprintf(MISSING_STYLES_MSG, stylesheetName)),
					),
				),
				RTE.map(constVoid),
		  )
		: RTE.right(void 0);

/**
 * To be executed in the `onClientEntry` API.
 */
export const onClientEntryProgram: RTE.ReaderTaskEither<
	OnClientEntryProgramEnv,
	Error,
	void
> = pipe(
	[setupLegacyToolbar, setWindowPluginOptions, checkStyles("styles")],
	RTE.sequenceArray,
	RTE.map(constVoid),
);

/**
 * Called when the Gatsby browser runtime first starts.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/#onClientEntry
 */
export const onClientEntry: NonNullable<gatsby.GatsbyBrowser["onClientEntry"]> =
	async (
		_gatsbyContext: gatsby.BrowserPluginArgs,
		pluginOptions: PluginOptions,
	) =>
		// We don't care about the output of the program so we won't be doing
		// anything with the result.
		await onClientEntryProgram({ pluginOptions })();
