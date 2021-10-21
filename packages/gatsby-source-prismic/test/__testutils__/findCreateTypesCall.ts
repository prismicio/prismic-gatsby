import * as sinon from "sinon";

export const findCreateTypesCall = (
	name: string,
	createTypes: sinon.SinonStub,
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
any =>
	createTypes.getCalls().find((call) => call.firstArg.config.name === name)
		?.firstArg;
