import * as React from "react";
import * as gatsbyPrismic from "gatsby-source-prismic";
import * as cookie from "es-cookie";

import { sprintf } from "./lib/sprintf";

import {
	PluginOptions,
	PrismicRepositoryConfig,
	PrismicUnpublishedRepositoryConfig,
} from "./types";
import {
	COOKIE_ACCESS_TOKEN_NAME,
	MISSING_PLUGIN_MSG,
	WINDOW_PLUGIN_OPTIONS_KEY,
	WINDOW_PROVIDER_PRESENCE_KEY,
} from "./constants";

export enum StateKind {
	/**
	 * Initial state. Preview session state unknown.
	 */
	Init = "init",

	/**
	 * Not a preview session.
	 */
	NotPreview = "notPreview",

	/**
	 * Preview URL is being resolve.
	 */
	Resolving = "resolving",

	/**
	 * Preview URL has been resolved.
	 */
	Resolved = "resolved",

	/**
	 * Fetching preview content.
	 */
	Bootstrapping = "bootstrapping",

	/**
	 * Preview session is active and preview content is ready for use.
	 */
	Bootstrapped = "bootstrapped",

	/**
	 * Preview failed for any reason.
	 */
	Failed = "failed",
}

type State<RepositoryName extends string = string> = {
	/**
	 * The repository name of the preview session, if active.
	 */
	activeRepositoryName: RepositoryName | undefined;

	/**
	 * Record of `gatsby-source-prismic` runtimes keyed by their repository name.
	 */
	runtimeStore: Record<RepositoryName, gatsbyPrismic.Runtime>;

	/**
	 * Record of plugin options keyed by their repository name.
	 */
	pluginOptionsStore: Record<RepositoryName, PluginOptions>;

	/**
	 * Configuration for each repository
	 */
	repositoryConfigs: PrismicUnpublishedRepositoryConfig<RepositoryName>[];
} & (
	| {
			state: StateKind.Init;
			stateContext: undefined;
	  }
	| {
			state: StateKind.NotPreview;
			stateContext: undefined;
	  }
	| {
			state: StateKind.Resolving;
			stateContext: undefined;
	  }
	| {
			state: StateKind.Resolved;
			stateContext: {
				/**
				 * The resolved URL of the previewed document.
				 */
				resolvedURL: string;
			};
	  }
	| {
			state: StateKind.Bootstrapping;
			stateContext: undefined;
	  }
	| {
			state: StateKind.Bootstrapped;
			stateContext: undefined;
	  }
	| {
			state: StateKind.Failed;
			stateContext: {
				/**
				 * The error encountered during a preview session.
				 */
				error: Error;
			};
	  }
);

export enum ActionKind {
	// States
	NotAPreview,
	StartResolving,
	Resolved,
	StartBootstrapping,
	Bootstrapped,
	Failed,

	// Utilities
	SetAccessToken,
	RegisterRuntime,
}

type Action =
	| {
			type: ActionKind.NotAPreview;
	  }
	| {
			type: ActionKind.StartResolving;
			payload: { repositoryName: string };
	  }
	| {
			type: ActionKind.Resolved;
			payload: { resolvedURL: string };
	  }
	| {
			type: ActionKind.StartBootstrapping;
			payload: { repositoryName: string };
	  }
	| {
			type: ActionKind.Bootstrapped;
	  }
	| {
			type: ActionKind.Failed;
			payload: { error: Error };
	  }
	| {
			type: ActionKind.SetAccessToken;
			payload: {
				repositoryName: string;
				accessToken: string;
			};
	  }
	| {
			type: ActionKind.RegisterRuntime;
			payload: {
				repositoryName: string;
				runtime: gatsbyPrismic.Runtime;
			};
	  };

const initialState: State = {
	state: StateKind.Init,
	stateContext: undefined,
	activeRepositoryName: undefined,
	runtimeStore: {},
	pluginOptionsStore: {},
	repositoryConfigs: [],
};

const initState = <RepositoryName extends string = string>(
	repositoryConfigs: PrismicUnpublishedRepositoryConfig<RepositoryName>[],
): State => {
	const state = {
		...initialState,
		repositoryConfigs,
	};

	// Copy plugin options into state. The plugin options store was set on
	// `window` in `on-client-entry.ts`.
	if (typeof window !== "undefined") {
		// Warn the user if no `gatsby-plugin-prismic-previews`
		// instances were registered in `gatsby-config.js`. An
		// undefined pluginOptionsStore signals this case.
		if (
			process.env.NODE_ENV === "development" &&
			!window[WINDOW_PLUGIN_OPTIONS_KEY]
		) {
			console.warn(MISSING_PLUGIN_MSG);
		}

		state.pluginOptionsStore = { ...window[WINDOW_PLUGIN_OPTIONS_KEY] };

		// If a repository does not have an access token configured,
		// attempt to hydrate it with an access token persisted in
		// a cookie.
		const repositoryNames = Object.keys(state.pluginOptionsStore);
		for (const repositoryName of repositoryNames) {
			if (!state.pluginOptionsStore[repositoryName].accessToken) {
				const cookieName = sprintf(COOKIE_ACCESS_TOKEN_NAME, repositoryName);

				state.pluginOptionsStore[repositoryName].accessToken =
					cookie.get(cookieName);
			}
		}
	}

	return state;
};

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case ActionKind.NotAPreview: {
			return {
				...initialState,
				state: StateKind.NotPreview,
			};
		}

		case ActionKind.StartResolving: {
			return {
				...state,
				state: StateKind.Resolving,
				stateContext: undefined,
				activeRepositoryName: action.payload.repositoryName,
			};
		}

		case ActionKind.Resolved: {
			return {
				...state,
				state: StateKind.Resolved,
				stateContext: { resolvedURL: action.payload.resolvedURL },
			};
		}

		case ActionKind.StartBootstrapping: {
			return {
				...state,
				state: StateKind.Bootstrapping,
				stateContext: undefined,
				activeRepositoryName: action.payload.repositoryName,
			};
		}

		case ActionKind.Bootstrapped: {
			return {
				...state,
				state: StateKind.Bootstrapped,
				stateContext: undefined,
			};
		}

		case ActionKind.Failed: {
			return {
				...state,
				state: StateKind.Failed,
				stateContext: { error: action.payload.error },
			};
		}

		case ActionKind.SetAccessToken: {
			return {
				...state,
				pluginOptionsStore: {
					...state.pluginOptionsStore,
					[action.payload.repositoryName]: {
						...state.pluginOptionsStore[action.payload.repositoryName],
						accessToken: action.payload.accessToken,
					},
				},
			};
		}

		case ActionKind.RegisterRuntime: {
			return {
				...state,
				runtimeStore: {
					...state.runtimeStore,
					[action.payload.repositoryName]: action.payload.runtime,
				},
			};
		}
	}
};

export type PrismicContextType = [State, React.Dispatch<Action>];

export const PrismicContext = React.createContext<PrismicContextType>([
	initialState,
	() => void 0,
]);

export type PrismicProviderProps<RepositoryName extends string = string> = {
	repositoryConfigs?: PrismicUnpublishedRepositoryConfig<RepositoryName>[];
	children?: React.ReactNode;
};

export const PrismicPreviewProvider = <RepositoryName extends string = string>({
	repositoryConfigs = [],
	children,
}: PrismicProviderProps<RepositoryName>): JSX.Element => {
	const reducerTuple = React.useReducer(reducer, repositoryConfigs, initState);

	if (typeof window !== "undefined") {
		window[WINDOW_PROVIDER_PRESENCE_KEY] = true;
	}

	return (
		<PrismicContext.Provider value={reducerTuple}>
			{children}
		</PrismicContext.Provider>
	);
};
