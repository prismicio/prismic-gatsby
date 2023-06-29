export const defaultTransformFieldName = (fieldName: string): string => {
	return fieldName.replace(/-/g, "_");
};
