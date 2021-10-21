import * as prismicT from "@prismicio/types";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as R from "fp-ts/Record";
import * as O from "fp-ts/Option";
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
		RTE.bind("path", () => RTE.right(dotPath(config.path))),
		RTE.bindW("predicate", (scope) =>
			pipe(
				scope.pluginOptions.shouldDownloadFiles,
				R.lookup(scope.path),
				O.map((predicate) =>
					typeof predicate === "boolean" ? () => predicate : predicate,
				),
				O.getOrElseW(() => () => false),
				RTE.right,
			),
		),
		RTE.map((scope) => scope.predicate(config.field)),
	);
