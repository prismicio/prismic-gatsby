import { RenderBodyArgs } from "gatsby";

export const createRenderBodyArgs = (): RenderBodyArgs => {
	return {
		pathname: "pathname",
		loadPageDataSync: () => {
			throw new Error("not implemented");
		},
		setBodyAttributes: () => {
			throw new Error("not implemented");
		},
		setBodyProps: () => {
			throw new Error("not implemented");
		},
		setHeadComponents: () => {
			throw new Error("not implemented");
		},
		setHtmlAttributes: () => {
			throw new Error("not implemented");
		},
		setPostBodyComponents: () => {
			throw new Error("not implemented");
		},
		setPreBodyComponents: () => {
			throw new Error("not implemented");
		},
	};
};
