import md5 from "tiny-hashes/md5";

import { TYPE_PATHS_BASENAME_TEMPLATE } from "../constants";
import { sprintf } from "./sprintf";

export interface BuildTypePathsStoreFilenameEnv {
	repositoryName: string;
}

export const buildTypePathsStoreFilename = (repositoryName: string): string => {
	return `${md5(sprintf(TYPE_PATHS_BASENAME_TEMPLATE, repositoryName))}.json`;
};
