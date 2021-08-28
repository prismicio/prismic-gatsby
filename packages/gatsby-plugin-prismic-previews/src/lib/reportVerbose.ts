import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/function";

import { REPORTER_TEMPLATE } from "../constants";

import { sprintf } from "./sprintf";

export interface ReportVerboseEnv {
	repositoryName: string;
	reportVerbose(text: string): void;
}

export const reportVerbose = (
	text: string,
): RTE.ReaderTaskEither<ReportVerboseEnv, never, void> =>
	RTE.asks((env) =>
		pipe(
			sprintf(REPORTER_TEMPLATE, env.repositoryName, text),
			env.reportVerbose,
		),
	);
