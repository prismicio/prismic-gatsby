import * as ava from "ava";
import * as sinon from "sinon";
import * as crypto from "crypto";

import { UnpreparedPluginOptions } from "../../src/types";

export const createPluginOptions = (
	t: ava.ExecutionContext,
): UnpreparedPluginOptions => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");

	return {
		repositoryName,
		accessToken: "accessToken",
		typePrefix: "prefix",
		webhookSecret: "secret",
		linkResolver: () => "linkResolver",
		htmlSerializer: () => "htmlSerializer",
		// TODO: Remove the hardcoded default once this PR to @prismicio/client is merged:
		// https://github.com/prismicio/prismic-client/pull/195
		pageSize: 100,
		createRemoteFileNode: sinon.stub().resolves({ id: "remoteFileNodeId" }),
		plugins: [],
	};
};
