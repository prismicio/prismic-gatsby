import * as ava from "ava";
import * as sinon from "sinon";

import { UnpreparedPluginOptions } from "../../src/types";
import { md5 } from "./md5";

export const createPluginOptions = (
	t: ava.ExecutionContext,
): UnpreparedPluginOptions => {
	const repositoryName = md5(t.title);

	return {
		repositoryName,
		accessToken: "accessToken",
		typePrefix: "prefix",
		webhookSecret: "secret",
		linkResolver: () => "linkResolver",
		htmlSerializer: () => "htmlSerializer",
		createRemoteFileNode: sinon.stub().resolves({ id: "remoteFileNodeId" }),
		plugins: [],
	};
};
