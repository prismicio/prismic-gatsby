import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/function";

import { Dependencies } from "../types";
import { ErrorCode, REPORTER_TEMPLATE } from "../constants";
import { sprintf } from "./sprintf";

/**
 * Reports a piece of text at the "warning" importance level using the
 * environment's `reportWarning` function.
 *
 * @param text - Text to report.
 */
export const reportPanic = (
	code: ErrorCode,
	text: string,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
	pipe(
		RTE.ask<Dependencies>(),
		RTE.bind("sourceMessage", (scope) =>
			RTE.right(
				sprintf(REPORTER_TEMPLATE, scope.pluginOptions.repositoryName, text),
			),
		),
		RTE.chain((scope) =>
			RTE.fromIO(() =>
				scope.reporter.panic({
					id: code,
					context: {
						sourceMessage: scope.sourceMessage,
					},
				}),
			),
		),
	);
