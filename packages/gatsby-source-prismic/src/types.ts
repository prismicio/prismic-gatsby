import * as gatsby from "gatsby";
import * as gatsbyFs from "gatsby-source-filesystem";
import * as imgixGatsby from "@imgix/gatsby";
import * as prismic from "@prismicio/client";
import * as prismicH from "@prismicio/helpers";
import * as prismicT from "@prismicio/types";
import * as prismicCustomTypes from "@prismicio/custom-types-client";
import * as gqlc from "graphql-compose";
import * as RTE from "fp-ts/ReaderTaskEither";
import { NodeHelpers } from "gatsby-node-helpers";

import { Runtime } from "./runtime";

export type Mutable<T> = {
	-readonly [P in keyof T]: T[P];
};

export type UnknownRecord<K extends PropertyKey = PropertyKey> = Record<
	K,
	unknown
>;

export type IterableElement<TargetIterable> = TargetIterable extends Iterable<
	infer ElementType
>
	? ElementType
	: never;

export type JoiValidationError = InstanceType<
	gatsby.PluginOptionsSchemaArgs["Joi"]["ValidationError"]
>;

export type PrismicDocumentNodeInput<
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument,
> = TDocument & gatsby.NodeInput & { prismicId: string };

export enum TypePathKind {
	CustomType = "CustomType",
	SharedSliceVariation = "SharedSliceVariation",
	Field = "Field",
}

export interface TypePath {
	kind: TypePathKind;
	path: string[];
	type: PrismicTypePathType;
}

export interface SerializedTypePath extends Omit<TypePath, "path"> {
	path: string;
}

export type TypePathNode = TypePath & gatsby.Node;

export type TransformFieldNameFn = (fieldName: string) => string;

export interface Dependencies {
	prismicClient: prismic.Client;
	createTypes: gatsby.Actions["createTypes"];
	createNode: gatsby.Actions["createNode"];
	buildObjectType: gatsby.NodePluginSchema["buildObjectType"];
	buildUnionType: gatsby.NodePluginSchema["buildUnionType"];
	buildEnumType: gatsby.NodePluginSchema["buildEnumType"];
	buildScalarType: gatsby.NodePluginSchema["buildScalarType"];
	buildInterfaceType: gatsby.NodePluginSchema["buildInterfaceType"];
	getNode: gatsby.SourceNodesArgs["getNode"];
	getNodes: gatsby.SourceNodesArgs["getNodes"];
	touchNode: gatsby.Actions["touchNode"];
	deleteNode: gatsby.Actions["deleteNode"];
	createNodeId: gatsby.NodePluginArgs["createNodeId"];
	createContentDigest: gatsby.NodePluginArgs["createContentDigest"];
	schema: gatsby.NodePluginSchema;
	cache: gatsby.GatsbyCache;
	store: gatsby.Store;
	reporter: gatsby.Reporter;
	reportInfo: gatsby.Reporter["info"];
	reportWarning: gatsby.Reporter["warn"];
	globalNodeHelpers: NodeHelpers;
	nodeHelpers: NodeHelpers;
	pluginOptions: PluginOptions;
	webhookBody?: unknown;
	createRemoteFileNode: typeof gatsbyFs.createRemoteFileNode;
	transformFieldName: TransformFieldNameFn;
	runtime: Runtime;
}

type ShouldDownloadFilesPredicate = (
	field: prismicT.ImageFieldImage | prismicT.LinkToMediaField,
) => boolean;

export type UnpreparedPluginOptions = gatsby.PluginOptions & {
	repositoryName: string;
	accessToken?: string;
	apiEndpoint?: string;
	customTypesApiEndpoint?: string;
	releaseID?: string;
	graphQuery?: string;
	fetchLinks?: string[];
	lang?: string;
	pageSize?: number;
	linkResolver?: prismicH.LinkResolverFunction;
	htmlSerializer?: prismicH.HTMLFunctionSerializer | prismicH.HTMLMapSerializer;
	imageImgixParams?: imgixGatsby.ImgixUrlParams;
	imagePlaceholderImgixParams?: imgixGatsby.ImgixUrlParams;
	typePrefix?: string;
	webhookSecret?: string;
	shouldDownloadFiles?:
		| boolean
		| ShouldDownloadFilesPredicate
		| Record<string, boolean | ShouldDownloadFilesPredicate>;
	createRemoteFileNode?: typeof gatsbyFs.createRemoteFileNode;
	transformFieldName?: TransformFieldNameFn;
	fetch?: prismic.FetchLike & prismicCustomTypes.FetchLike;

	customTypesApiToken?: string;
	/**
	 * A record of all Custom Type API IDs mapped to their models.
	 *
	 * @deprecated Use the `customTypeModels` plugin option.
	 */
	schemas?: Record<string, prismicT.CustomTypeModelDefinition>;
	/**
	 * A list of all Custom Types models using the Custom Types API object shape.
	 */
	customTypeModels?: prismicT.CustomTypeModel[];
	/**
	 * A list of all Shared Slice models.
	 */
	sharedSliceModels?: prismicT.SharedSliceModel[];
};

export type PluginOptions = UnpreparedPluginOptions &
	Required<
		Pick<
			UnpreparedPluginOptions,
			| "apiEndpoint"
			| "customTypeModels"
			| "sharedSliceModels"
			| "imageImgixParams"
			| "imagePlaceholderImgixParams"
			| "shouldDownloadFiles"
			| "createRemoteFileNode"
			| "transformFieldName"
			| "fetch"
		>
	>;

export type FieldConfigCreator<
	TSchema extends prismicT.CustomTypeModelField = prismicT.CustomTypeModelField,
> = (
	path: string[],
	schema: TSchema,
) => RTE.ReaderTaskEither<
	Dependencies,
	Error,
	gqlc.ObjectTypeComposerFieldConfigDefinition<unknown, unknown>
>;

export type PrismicTypePathType =
	| PrismicSpecialType
	| prismicT.CustomTypeModelFieldType
	| prismicT.CustomTypeModelSliceType;

export enum PrismicSpecialType {
	Document = "Document",
	DocumentData = "DocumentData",
	SharedSliceVariation = "SharedSliceVariation",
	Unknown = "Unknown",
}

export interface PrismicAPIDocumentNode
	extends prismicT.PrismicDocument,
		gatsby.Node {
	prismicId: string;
}

export type PrismicWebhookBody =
	| PrismicWebhookBodyApiUpdate
	| PrismicWebhookBodyTestTrigger;

export enum PrismicWebhookType {
	APIUpdate = "api-update",
	TestTrigger = "test-trigger",
}

interface PrismicWebhookBodyBase {
	type: PrismicWebhookType;
	domain: string;
	apiUrl: string;
	secret: string | null;
}

export interface PrismicWebhookBodyApiUpdate extends PrismicWebhookBodyBase {
	type: PrismicWebhookType.APIUpdate;
	masterRef?: string;
	releases: PrismicWebhookOperations<PrismicWebhookRelease>;
	masks: PrismicWebhookOperations<PrismicWebhookMask>;
	tags: PrismicWebhookOperations<PrismicWebhookTag>;
	documents: string[];
	experiments?: PrismicWebhookOperations<PrismicWebhookExperiment>;
}

export interface PrismicWebhookBodyTestTrigger extends PrismicWebhookBodyBase {
	type: PrismicWebhookType.TestTrigger;
}

interface PrismicWebhookOperations<T> {
	update?: T[];
	addition?: T[];
	deletion?: T[];
}

interface PrismicWebhookMask {
	id: string;
	label: string;
}

interface PrismicWebhookTag {
	id: string;
}

export interface PrismicWebhookRelease {
	id: string;
	ref: string;
	label: string;
	documents: string[];
}

/**
 * @deprecated Experiments are no longer supported by Prismic.
 */
interface PrismicWebhookExperiment {
	id: string;
	name: string;
	variations: PrismicWebhookExperimentVariation[];
}

/**
 * @deprecated Experiments are no longer supported by Prismic.
 */
interface PrismicWebhookExperimentVariation {
	id: string;
	ref: string;
	label: string;
}

export type PrismicCustomTypeApiResponse = PrismicCustomTypeApiCustomType[];

export interface PrismicCustomTypeApiCustomType<
	Model extends prismicT.CustomTypeModel = prismicT.CustomTypeModel,
> {
	id: string;
	label: string;
	repeatable: boolean;
	json: Model;
}
