import * as RTE from "fp-ts/ReaderTaskEither";
import { pipe } from "fp-ts/function";

import { REPORTER_TEMPLATE } from "../constants";

import { sprintf } from "./sprintf";

interface ReportPanicEnv {
	repositoryName: string;
	reportPanic(text: string): void;
}

export const reportPanic = (
	text: string,
): RTE.ReaderTaskEither<ReportPanicEnv, never, void> =>
	RTE.asks((env) =>
		pipe(sprintf(REPORTER_TEMPLATE, env.repositoryName, text), env.reportPanic),
	);
