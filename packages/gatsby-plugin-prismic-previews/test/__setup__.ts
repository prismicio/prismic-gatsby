import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

import { URL } from "node:url";

import * as prismic from "@prismicio/client";
import { MockFactory, createMockFactory } from "@prismicio/mock";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import AbortController from "abort-controller";
import { BrowserPluginArgs } from "gatsby";
import { SetupServer, setupServer } from "msw/node";

import { createBrowserPluginArgs } from "./__testutils__/createBrowserPluginArgs";

import { usePrismicPreviewStore } from "../src/usePrismicPreviewStore";

declare module "vitest" {
	export interface TestContext {
		mock: MockFactory;
		server: SetupServer;
		browserPluginArgs: BrowserPluginArgs;
	}
}

const server = setupServer();

vi.stubGlobal("URL", URL);
vi.stubGlobal("AbortController", AbortController);

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

beforeEach((ctx) => {
	ctx.mock = createMockFactory({ seed: ctx.task.name });
	ctx.server = server;
	ctx.browserPluginArgs = createBrowserPluginArgs();

	// Reset window location.
	if (typeof window !== "undefined") {
		window.location.href = "https://example.com";
	}

	// Reset cookies.
	if (typeof document !== "undefined") {
		document.cookie = `${prismic.cookie.preview}={}`;
	}

	// Reset all global stores.
	usePrismicPreviewStore.getState().reset();
});

afterEach(() => {
	cleanup();
});

afterAll(() => {
	server.close();
});
