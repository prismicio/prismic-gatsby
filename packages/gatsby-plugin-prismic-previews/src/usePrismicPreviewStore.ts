import type { Client } from "@prismicio/client";
import { create } from "zustand";

import type {
	NormalizedDocument,
	PluginOptions,
	RepositoryConfig,
} from "./types";

type PrismicPreviewStore = {
	repositoryConfigs: RepositoryConfig[];
	setRepositoryConfigs: (repositoryConfigs: RepositoryConfig[]) => void;

	pluginOptions: Record<string, PluginOptions>;
	addPluginOptions: (pluginOptions: PluginOptions) => void;

	client: Client | undefined;
	setClient: (client: Client) => void;

	documents: Record<string, NormalizedDocument>;
	addDocument: (document: NormalizedDocument) => void;

	publishedDocumentIDs: string[];
	setPublishedDocumentIDs: (publishedDocumentIDs: string[]) => void;

	isBootstrapped: boolean;
	setIsBootstrapped: (isBootstrapped: boolean) => void;

	reset: () => void;
};

export const usePrismicPreviewStore = create<PrismicPreviewStore>()(
	(set, get) => {
		return {
			repositoryConfigs: [],
			setRepositoryConfigs: (repositoryConfigs: RepositoryConfig[]) => {
				set({ repositoryConfigs });
			},

			pluginOptions: {},
			addPluginOptions: (pluginOptions: PluginOptions) => {
				set({
					pluginOptions: {
						...get().pluginOptions,
						[pluginOptions.repositoryName]: pluginOptions,
					},
				});
			},

			client: undefined,
			setClient: (client: Client) => {
				set({ client });
			},

			documents: {},
			addDocument: (document: NormalizedDocument) => {
				set({
					documents: {
						...get().documents,
						[document.prismicId]: document,
					},
				});
			},

			publishedDocumentIDs: [],
			setPublishedDocumentIDs: (publishedDocumentIDs: string[]) => {
				set({ publishedDocumentIDs });
			},

			isBootstrapped: false,
			setIsBootstrapped: (isBootstrapped: boolean) => {
				set({ isBootstrapped });
			},

			reset: () => {
				return set({
					repositoryConfigs: [],
					pluginOptions: {},
					client: undefined,
					documents: {},
					publishedDocumentIDs: [],
					isBootstrapped: false,
				});
			},
		};
	},
);
