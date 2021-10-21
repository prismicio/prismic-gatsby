import { SerializedTypePath, TypePath } from "../types";
import { serializePath } from "./serializePath";

export const serializeTypePaths = (
	typePaths: TypePath[],
): SerializedTypePath[] => {
	return typePaths.map((typePath) => {
		return {
			...typePath,
			path: serializePath(typePath.path),
		};
	});
};
