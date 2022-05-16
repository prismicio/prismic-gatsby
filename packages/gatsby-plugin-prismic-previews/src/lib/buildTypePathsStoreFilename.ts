import { TYPE_PATHS_BASENAME_TEMPLATE } from "../constants";
import { sprintf } from "./sprintf";

export interface BuildTypePathsStoreFilenameEnv {
	repositoryName: string;
}

export const buildTypePathsStoreFilename = (repositoryName: string): string => {
	return `${sprintf(TYPE_PATHS_BASENAME_TEMPLATE, repositoryName)}.json`;
};
