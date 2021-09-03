import * as sinon from "sinon";
import * as gatsby from "gatsby";
import { PartialDeep } from "type-fest";

export const createGatsbyContext = (): PartialDeep<
	gatsby.NodePluginArgs | gatsby.BrowserPluginArgs
> & {
	// These properties are listed here to appease tests that expect them to be
	// present. Add other properties only as needed.
	reporter: Partial<gatsby.NodePluginArgs["reporter"]>;
} => ({
	createNodeId: sinon.stub().callsFake((x) => x),
	createContentDigest: sinon.stub().returns("createContentDigest"),
	getNodesByType: sinon.stub(),
	reporter: {
		panic: sinon.stub(),
		verbose: sinon.stub(),
	},
});
