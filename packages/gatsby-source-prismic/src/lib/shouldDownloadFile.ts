import * as prismicT from "@prismicio/types";
import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/function";

import { Dependencies } from "../types";

import { dotPath } from "./dotPath";

type ShouldDownloadFileConfig = {
	path: string[];
	field: prismicT.ImageFieldImage | prismicT.LinkToMediaField;
};

export const shouldDownloadFile = (
	config: ShouldDownloadFileConfig,
): RTE.ReaderTaskEither<Dependencies, never, boolean> =>
	pipe(
		RTE.ask<Dependencies>(),
		RTE.bindW("predicate", (scope) => {
			const { shouldDownloadFiles } = scope.pluginOptions;
			const fieldPath = dotPath(config.path);

			switch (typeof shouldDownloadFiles) {
				case "boolean": {
					return RTE.right(() => shouldDownloadFiles);
				}

				case "function": {
					return RTE.right(shouldDownloadFiles);
				}

				case "object": {
					const fieldPredicate = shouldDownloadFiles[fieldPath];

					if (fieldPredicate) {
						if (typeof fieldPredicate === "boolean") {
							return RTE.right(() => fieldPredicate);
						} else if (typeof fieldPredicate === "function") {
							return RTE.right(fieldPredicate);
						}
					}
				}
			}

			return RTE.right(() => false);
		}),
		RTE.map((scope) => scope.predicate(config.field)),
	);
