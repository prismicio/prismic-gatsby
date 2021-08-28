import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/function";

import { Dependencies, FieldConfigCreator } from "../types";

/**
 * Builds a GraphQL field configuration object for an Embed Custom Type field.
 * It uses a shared type and the `@link` extension to connect data to the field.
 * Data for each Embed field is created as a separate node to allow Gatsby to
 * infer the fields and types. The resulting configuration object can be used in
 * a GraphQL type.
 *
 * This function registers a typepath for the field.
 *
 * @param path - Path to the field.
 *
 * @returns GraphQL field configuration object.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildEmbedFieldConfig: FieldConfigCreator = () =>
	pipe(
		RTE.ask<Dependencies>(),
		RTE.map((deps) => ({
			type: deps.nodeHelpers.createTypeName("EmbedType"),
			extensions: { link: {} },
		})),
	);
