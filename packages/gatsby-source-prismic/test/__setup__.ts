import { beforeEach } from "vitest";

import { MockFactory, createMockFactory } from "@prismicio/mock";

declare module "vitest" {
	export interface TestContext {
		mock: MockFactory;
	}
}

beforeEach((ctx) => {
	ctx.mock = createMockFactory({ seed: ctx.task.name });
});
