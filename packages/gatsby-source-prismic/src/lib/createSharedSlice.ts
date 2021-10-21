import * as gatsby from "gatsby";
import * as prismicT from "@prismicio/types";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";

import { Dependencies } from "../types";
import { buildSharedSliceVariationTypes } from "../builders/buildSharedSliceVariationTypes";
import { createType } from "./createType";
import { createTypes } from "./createTypes";
import { getTypeName } from "./getTypeName";
import { buildUnionType } from "./buildUnionType";

export const createSharedSlice = (
	sharedSliceModel: prismicT.SharedSliceModel,
): RTE.ReaderTaskEither<Dependencies, Error, gatsby.GatsbyGraphQLUnionType> =>
	pipe(
		RTE.ask<Dependencies>(),
		RTE.bind("variationTypes", () =>
			pipe(
				buildSharedSliceVariationTypes(
					[sharedSliceModel.id],
					sharedSliceModel.variations,
				),
				RTE.chainFirstW(createTypes),
				RTE.map(A.map(getTypeName)),
			),
		),
		RTE.chainW((scope) =>
			buildUnionType({
				name: scope.nodeHelpers.createTypeName([sharedSliceModel.id]),
				types: scope.variationTypes,
				resolveType: (source: prismicT.SharedSlice) =>
					scope.nodeHelpers.createTypeName([
						source.slice_type,
						source.variation,
					]),
			}),
		),
		RTE.chainFirstW(createType),
	);
