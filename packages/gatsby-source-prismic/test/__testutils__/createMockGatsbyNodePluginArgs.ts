import crypto from "crypto";
import EventEmitter from "events";
import type {
	CreateSchemaCustomizationArgs,
	GatsbyCache,
	GatsbyConfig,
	Node,
	ParentSpanPluginArgs,
	SourceNodesArgs,
} from "gatsby";

export const createMockGatsbyCache = (): GatsbyCache => {
	const cache = new Map();

	return {
		name: Date.now().toString(),
		directory: Date.now().toString(),
		get: async (key) => cache.get(key),
		set: async (key, value) => {
			cache.set(key, value);

			return value;
		},
		del: async (key) => void cache.delete(key),
	};
};

class MockSpan {
	context() {
		throw new Error("not implemented");
	}
	tracer() {
		throw new Error("not implemented");
	}
	setOperationName() {
		throw new Error("not implemented");
	}
	setBaggageItem() {
		throw new Error("not implemented");
	}
	getBaggageItem() {
		throw new Error("not implemented");
	}
	setTag() {
		throw new Error("not implemented");
	}
	addTags() {
		throw new Error("not implemented");
	}
	log() {
		throw new Error("not implemented");
	}
	logEvent() {
		throw new Error("not implemented");
	}
	finish() {
		throw new Error("not implemented");
	}
	protected _context() {
		throw new Error("not implemented");
	}
	protected _tracer() {
		throw new Error("not implemented");
	}
	protected _setOperationName() {
		throw new Error("not implemented");
	}
	protected _setBaggageItem() {
		throw new Error("not implemented");
	}
	protected _getBaggageItem() {
		throw new Error("not implemented");
	}
	protected _addTags() {
		throw new Error("not implemented");
	}
	protected _log() {
		throw new Error("not implemented");
	}
	protected _finish() {
		throw new Error("not implemented");
	}
}

type CreateMockGatsbyNodePluginArgsConfig = {
	gatsbyConfig?: GatsbyConfig;
};

export const createMockGatsbyNodePluginArgs = (
	config?: CreateMockGatsbyNodePluginArgsConfig,
): ParentSpanPluginArgs => {
	const cache = createMockGatsbyCache();
	const nodeStore = new Map<string, Node>();

	return {
		parentSpan: new MockSpan() as unknown as ParentSpanPluginArgs["parentSpan"],
		cache,
		schema: {
			buildEnumType: (config) => ({ kind: "ENUM", config }),
			buildInputObjectType: (config) => ({ kind: "INPUT_OBJECT", config }),
			buildInterfaceType: (config) => ({ kind: "INTERFACE", config }),
			buildObjectType: (config) => ({ kind: "OBJECT", config }),
			buildScalarType: (config) => ({ kind: "SCALAR", config }),
			buildUnionType: (config) => ({ kind: "UNION", config }),
		},
		store: {
			dispatch: () => {
				throw new Error("not implemented");
			},
			subscribe: () => {
				throw new Error("not implemented");
			},
			getState: () => {
				throw new Error("not implemented");
			},
			replaceReducer: () => {
				throw new Error("not implemented");
			},
		},
		actions: {
			endJob: () => {
				throw new Error("not implemented");
			},
			setJob: () => {
				throw new Error("not implemented");
			},
			createJob: () => {
				throw new Error("not implemented");
			},
			touchNode: () => {
				throw new Error("not implemented");
			},
			createNode: (node) => {
				const extendedNode: Node = {
					...node,
					parent: null,
					children: [],
					internal: {
						...node.internal,
						owner: "__MOCK_OWNER__",
					},
				};

				nodeStore.set(node.id, extendedNode);
			},
			createPage: () => {
				throw new Error("not implemented");
			},
			createSlice: () => {
				throw new Error("not implemented");
			},
			deleteNode: () => {
				throw new Error("not implemented");
			},
			deletePage: () => {
				throw new Error("not implemented");
			},
			createJobV2: () => {
				throw new Error("not implemented");
			},
			createTypes: () => void 0,
			createRedirect: () => {
				throw new Error("not implemented");
			},
			setBabelPlugin: () => {
				throw new Error("not implemented");
			},
			setBabelPreset: () => {
				throw new Error("not implemented");
			},
			createNodeField: () => {
				throw new Error("not implemented");
			},
			setBabelOptions: () => {
				throw new Error("not implemented");
			},
			setPluginStatus: () => {
				throw new Error("not implemented");
			},
			setWebpackConfig: () => {
				throw new Error("not implemented");
			},
			addThirdPartySchema: () => {
				throw new Error("not implemented");
			},
			createFieldExtension: () => {
				throw new Error("not implemented");
			},
			printTypeDefinitions: () => {
				throw new Error("not implemented");
			},
			replaceWebpackConfig: () => {
				throw new Error("not implemented");
			},
			createParentChildLink: () => {
				throw new Error("not implemented");
			},
			unstable_createNodeManifest: () => {
				throw new Error("not implemented");
			},
			setRequestHeaders: () => {
				throw new Error("not implemented");
			},
			addGatsbyImageSourceUrl: () => {
				throw new Error("not implemented");
			},
		},
		emitter: new EventEmitter(),
		getNode: (id) => nodeStore.get(id),
		tracing: {
			tracer: {},
			parentSpan: {},
			startSpan: () => {
				throw new Error("not implemented");
			},
		},
		basePath: config?.gatsbyConfig?.pathPrefix || "",
		pathPrefix: config?.gatsbyConfig?.pathPrefix || "",
		getCache: () => {
			throw new Error("not implemented");
		},
		getNodes: () => [...nodeStore.values()],
		reporter: {
			log: () => void 0,
			info: () => void 0,
			warn: () => void 0,
			error: () => {
				throw new Error("not implemented");
			},
			panic: () => {
				throw new Error("not implemented");
			},
			format: {} as ParentSpanPluginArgs["reporter"]["format"],
			uptime: () => {
				throw new Error("not implemented");
			},
			success: () => {
				throw new Error("not implemented");
			},
			verbose: () => {
				throw new Error("not implemented");
			},
			errorMap: {},
			_setStage: () => {
				throw new Error("not implemented");
			},
			setNoColor: () => {
				throw new Error("not implemented");
			},
			setVerbose: () => {
				throw new Error("not implemented");
			},
			setErrorMap: () => {
				throw new Error("not implemented");
			},
			stripIndent: () => {
				throw new Error("not implemented");
			},
			panicOnBuild: () => {
				throw new Error("not implemented");
			},
			activityTimer: () => {
				return {
					start: () => void 0,
					end: () => void 0,
					panic: () => {
						throw new Error("not implemented");
					},
					panicOnBuild: () => {
						throw new Error("not implemented");
					},
					setStatus: () => {
						throw new Error("not implemented");
					},
					span: {} as ReturnType<
						ParentSpanPluginArgs["reporter"]["activityTimer"]
					>["span"],
				};
			},
			createProgress: () => {
				throw new Error("not implemented");
			},
			_renderPageTree: () => {
				throw new Error("not implemented");
			},
			pendingActivity: () => {
				throw new Error("not implemented");
			},
			phantomActivity: () => {
				throw new Error("not implemented");
			},
			completeActivity: () => {
				throw new Error("not implemented");
			},
			_initReporterMessagingInMain: () => {
				throw new Error("not implemented");
			},
			_initReporterMessagingInWorker: () => {
				throw new Error("not implemented");
			},
			_registerAdditionalDiagnosticOutputHandler: () => {
				throw new Error("not implemented");
			},
		},
		createNodeId: (input) =>
			crypto.createHash("md5").update(input).digest("hex"),
		getNodesByType: (type) =>
			[...nodeStore.values()].filter((node) => node.internal.type === type),
		loadNodeContent: () => {
			throw new Error("not implemented");
		},
		createContentDigest: (input) =>
			crypto
				.createHash("md5")
				.update(typeof input === "string" ? input : JSON.stringify(input))
				.digest("hex"),
		getNodeAndSavePathDependency: () => {
			throw new Error("not implemented");
		},
	};
};

export const createMockCreateSchemaCustomizationGatsbyNodePluginArgs = (
	config?: CreateMockGatsbyNodePluginArgsConfig,
): CreateSchemaCustomizationArgs => {
	const gatsbyNodePluginArgs = createMockGatsbyNodePluginArgs(config);

	return {
		...gatsbyNodePluginArgs,
		traceId: "initial-createSchemaCustomization",
	};
};

export const createMockSourceNodesGatsbyNodePluginArgs = (
	config?: CreateMockGatsbyNodePluginArgsConfig,
): SourceNodesArgs => {
	const gatsbyNodePluginArgs = createMockGatsbyNodePluginArgs(config);

	return {
		...gatsbyNodePluginArgs,
		traceId: "initial-sourceNodes",
		waitForCascadingActions: false,
		webhookBody: {},
	};
};
