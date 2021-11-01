import * as gatsby from "gatsby";
import * as prismicH from "@prismicio/helpers";
import * as prismicT from "@prismicio/types";
import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe, identity } from "fp-ts/function";

import { buildObjectType } from "../lib/buildObjectType";

import { Dependencies } from "../types";
import { buildScalarType } from "../lib/buildScalarType";
import { requiredTypeName } from "../lib/requiredTypeName";
import { createType } from "../lib/createType";

/**
 * Builds a GraphQL Type used by StructuredText fields. The resulting type can
 * be created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildStructuredTextType: RTE.ReaderTaskEither<
	Dependencies,
	never,
	gatsby.GatsbyGraphQLType
> = pipe(
	RTE.ask<Dependencies>(),
	RTE.bind("structuredTextScalar", (deps) =>
		buildScalarType({
			name: deps.globalNodeHelpers.createTypeName("StructuredText"),
			description:
				"Text content with rich formatting capabilities using a Prismic format called Structured Text.",
		}),
	),
	RTE.chainFirst((scope) => createType(scope.structuredTextScalar)),
	RTE.chain((scope) =>
		buildObjectType({
			name: scope.nodeHelpers.createTypeName("StructuredTextType"),
			fields: {
				text: {
					type: "String",
					resolve: (source: prismicT.RichTextField) => prismicH.asText(source),
				},
				html: {
					type: "String",
					resolve: (source: prismicT.RichTextField) =>
						prismicH.asHTML(
							source,
							scope.pluginOptions.linkResolver,
							scope.pluginOptions.htmlSerializer,
						),
				},
				richText: {
					type: requiredTypeName(scope.structuredTextScalar.config.name),
					resolve: identity,
				},
				raw: {
					type: requiredTypeName(scope.structuredTextScalar.config.name),
					resolve: identity,
					deprecationReason:
						"This field has been renamed to `richText`. The `richText` field has the same value the `raw` field.",
				},
			},
		}),
	),
);
