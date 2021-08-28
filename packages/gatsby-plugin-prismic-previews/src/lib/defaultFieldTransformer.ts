export const defaultFieldTransformer = (fieldName: string): string =>
	fieldName.replace(/-/g, "_");
