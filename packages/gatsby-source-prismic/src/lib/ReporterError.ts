import * as gatsby from "gatsby";
import { ValueOf } from "type-fest";

import { ErrorCode } from "../constants";

type Level = ValueOf<gatsby.Reporter["errorMap"]>["level"];

type ReporterErrorConfig<Context> = {
	code?: ErrorCode;
	context?: Context;
	level?: Level;
};

export class ReporterError<Context> extends Error {
	code: ErrorCode;
	level: Level;
	context?: Context;

	constructor(message: string, config?: ReporterErrorConfig<Context>) {
		super(message);

		this.code = config?.code || ErrorCode.GENERIC;
		this.context = config?.context;
		this.level = config?.level || "DEBUG";
	}
}

export const createReporterError = <Context>(
	message: string,
	config?: ReporterErrorConfig<Context>,
): ReporterError<Context> => {
	return new ReporterError<Context>(message, config);
};
