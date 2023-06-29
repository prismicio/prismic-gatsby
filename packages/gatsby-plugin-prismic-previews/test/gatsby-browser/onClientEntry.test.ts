// `gatsby-browser`'s `onClientEntry` API, at the time of writing, only injects
// a `gatsby-plugin-prismic-previews` options object into the `pluginOptions`
// store. We don't need to test that implementation detail since it will be
// tested as part of `withPrismicPreview()` and its siblings.
//
// If additional functionality is added to `onClientEntry`, feel free to remove
// this note and add tests.
//
// - 2022-07-18 Angelo
import { test } from "vitest";

test("noop test");
