import * as prismicT from "@prismicio/types";
import * as prismicH from "@prismicio/helpers";
import * as imgixGatsby from "@imgix/gatsby";
import * as nodeHelpers from "gatsby-node-helpers";
import { pipe } from "fp-ts/function";

import { SerializedTypePath, TransformFieldNameFn, TypePath } from "../types";
import { normalize } from "./normalize";
import {
	DEFAULT_IMGIX_PARAMS,
	DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
	GLOBAL_TYPE_PREFIX,
} from "../constants";
import { NormalizedValue } from "./types";
import { SetRequired } from "type-fest";
import {
	customTypeModelToTypePaths,
	sharedSliceModelToTypePaths,
} from "./typePaths";
import { NormalizedDocumentValue } from "./normalizers";
import { serializeTypePaths } from "./serializeTypePaths";
import { serializePath } from "./serializePath";

// `createNodeId` would normally create a hash from its input, but we can treat
// it as an identity function since we are using it within the context of
// Prismic documents with unique IDs.
const createNodeId = (input: string): string => input;

// `createContentDigest` would normally create a hash from its input, but we
// can treat it as a stubbed function since a Gatsby node's
// `internal.contentDigest` property is an internal field. In a runtime
// preview, we don't need the digest.
const createContentDigest = <T>(_input: T): string =>
	"contentDigest is not supported during previews";

export type RuntimeConfig = {
	typePrefix?: string;
	linkResolver?: prismicH.LinkResolverFunction;
	imageImgixParams?: imgixGatsby.ImgixUrlParams;
	imagePlaceholderImgixParams?: imgixGatsby.ImgixUrlParams;
	htmlSerializer?: prismicH.HTMLMapSerializer | prismicH.HTMLFunctionSerializer;
	transformFieldName?: TransformFieldNameFn;
};

type SubscriberFn = () => void;

export const createRuntime = (config: RuntimeConfig = {}): Runtime => {
	return new Runtime(config);
};

export class Runtime {
	nodes: NormalizedDocumentValue[];
	typePaths: SerializedTypePath[];
	subscribers: SubscriberFn[];

	config: SetRequired<
		RuntimeConfig,
		"imageImgixParams" | "imagePlaceholderImgixParams" | "transformFieldName"
	>;

	nodeHelpers: nodeHelpers.NodeHelpers;

	constructor(config: RuntimeConfig = {}) {
		this.nodes = [];
		this.typePaths = [];
		this.subscribers = [];

		this.config = {
			...config,
			imageImgixParams: config.imageImgixParams ?? DEFAULT_IMGIX_PARAMS,
			imagePlaceholderImgixParams:
				config.imagePlaceholderImgixParams ?? DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
			transformFieldName:
				config.transformFieldName ??
				((fieldName: string) => fieldName.replace(/-/g, "_")),
		};

		this.nodeHelpers = nodeHelpers.createNodeHelpers({
			typePrefix: [GLOBAL_TYPE_PREFIX, config.typePrefix]
				.filter(Boolean)
				.join(" "),
			fieldPrefix: GLOBAL_TYPE_PREFIX,
			createNodeId,
			createContentDigest,
		});
	}

	subscribe(callback: SubscriberFn): void {
		this.subscribers = [...this.subscribers, callback];
	}

	unsubscribe(callback: SubscriberFn): void {
		this.subscribers = this.subscribers.filter(
			(registeredCallback) => registeredCallback !== callback,
		);
	}

	registerCustomTypeModel(
		model: prismicT.CustomTypeModel,
	): SerializedTypePath[] {
		const typePaths = pipe(
			customTypeModelToTypePaths(model, this.config.transformFieldName),
			serializeTypePaths,
		);

		this.typePaths = [...this.typePaths, ...typePaths];

		this.#notifySubscribers();

		return typePaths;
	}

	registerCustomTypeModels(
		models: prismicT.CustomTypeModel[],
	): SerializedTypePath[] {
		const typePaths = pipe(
			models.flatMap((model) =>
				customTypeModelToTypePaths(model, this.config.transformFieldName),
			),
			serializeTypePaths,
		);

		this.typePaths = [...this.typePaths, ...typePaths];

		this.#notifySubscribers();

		return typePaths;
	}

	registerSharedSliceModel(
		model: prismicT.SharedSliceModel,
	): SerializedTypePath[] {
		const typePaths = pipe(
			sharedSliceModelToTypePaths(model, this.config.transformFieldName),
			serializeTypePaths,
		);

		this.typePaths = [...this.typePaths, ...typePaths];

		this.#notifySubscribers();

		return typePaths;
	}

	registerSharedSliceModels(
		models: prismicT.SharedSliceModel[],
	): SerializedTypePath[] {
		const typePaths = pipe(
			models.flatMap((model) =>
				sharedSliceModelToTypePaths(model, this.config.transformFieldName),
			),
			serializeTypePaths,
		);

		this.typePaths = [...this.typePaths, ...typePaths];

		this.#notifySubscribers();

		return typePaths;
	}

	registerDocument<PrismicDocument extends prismicT.PrismicDocument>(
		document: PrismicDocument,
	): NormalizedDocumentValue<PrismicDocument> {
		const normalizedDocument = this.normalizeDocument(document);

		this.nodes = [...this.nodes, normalizedDocument];

		this.#notifySubscribers();

		return normalizedDocument;
	}

	registerDocuments<PrismicDocument extends prismicT.PrismicDocument>(
		documents: PrismicDocument[],
	): NormalizedDocumentValue<PrismicDocument>[] {
		const nodes = documents.map((document) => {
			return this.normalizeDocument(document);
		});

		this.nodes = [...this.nodes, ...nodes];

		this.#notifySubscribers();

		return nodes;
	}

	normalizeDocument<PrismicDocument extends prismicT.PrismicDocument>(
		document: PrismicDocument,
	): NormalizedDocumentValue<PrismicDocument> {
		return this.normalize(document, [
			document.type,
		]) as NormalizedDocumentValue<PrismicDocument>;
	}

	normalize<Value>(value: Value, path: string[]): NormalizedValue<Value> {
		return normalize({
			value,
			path,
			getNode: this.getNode.bind(this),
			getTypePath: this.getTypePath.bind(this),
			nodeHelpers: this.nodeHelpers,
			linkResolver: this.config.linkResolver,
			htmlSerializer: this.config.htmlSerializer,
			imageImgixParams: this.config.imageImgixParams,
			imagePlaceholderImgixParams: this.config.imagePlaceholderImgixParams,
			transformFieldName: this.config.transformFieldName,
		});
	}

	getNode<Document extends prismicT.PrismicDocument>(
		id: string,
	): NormalizedDocumentValue<Document> | undefined {
		return this.nodes.find(
			(node): node is NormalizedDocumentValue<Document> =>
				node.prismicId === id,
		);
	}

	hasNode(id: string): boolean {
		return this.nodes.some((node) => node.prismicId === id);
	}

	getTypePath(path: string[]): SerializedTypePath | undefined {
		return this.typePaths.find(
			(typePath) => typePath.path === serializePath(path),
		);
	}

	exportTypePaths(): string {
		return JSON.stringify(this.typePaths);
	}

	importTypePaths(typePathsExport: string): TypePath[] {
		const importedTypePaths = JSON.parse(typePathsExport);

		this.typePaths = [...this.typePaths, ...importedTypePaths];

		this.#notifySubscribers();

		return importedTypePaths;
	}

	#notifySubscribers(): void {
		for (const subscriber of this.subscribers) {
			subscriber();
		}
	}
}
