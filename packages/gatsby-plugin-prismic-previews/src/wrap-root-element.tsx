import * as React from "react";
import * as gatsby from "gatsby";
import * as IO from "fp-ts/IO";
import * as IOE from "fp-ts/IOEither";
import { pipe } from "fp-ts/function";

import { PrismicPreviewProvider } from "./context";

/**
 * Determines if PrismicPreviewProvider has been added to the app. Because
 * multiple instances of this plugin can be added to an app, and we only need
 * one PrismicPreviewProvider, this in-memory boolean determines if one of the
 * plugin instances has already added the provider.
 *
 * The first plugin instance to run this API will set this to true.
 */
let isProviderAdded = false as boolean;

/**
 * Declares that the required context Provider has been added to the app. This
 * should be called immediately after the first successful attempt at adding the
 * Provider. This stops future attempts from adding additional Providers.
 */
const declareProviderAdded: IO.IO<void> = () => void (isProviderAdded = true);

/**
 * Allows plugins to wrap the root element of an app. This is useful to set up
 * any Provider components that will wrap your application.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/#wrapRootElement
 */
export const wrapRootElement: NonNullable<
	gatsby.GatsbyBrowser["wrapRootElement"]
> = (gatsbyContext: gatsby.WrapRootElementBrowserArgs) =>
	pipe(
		IOE.Do,
		IOE.filterOrElse(
			() => !isProviderAdded,
			() => new Error("PrismicPreviewProvider has already been added"),
		),
		IOE.chainFirst(() => IOE.fromIO(declareProviderAdded)),
		IOE.map(() => (
			<PrismicPreviewProvider key="gatsby-plugin-prismic-previews-provider">
				{gatsbyContext.element}
			</PrismicPreviewProvider>
		)),
		IOE.getOrElse(() => IO.of(gatsbyContext.element)),
	)();
