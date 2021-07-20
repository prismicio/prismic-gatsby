/**
 * Converts a given GraphQL type name to a list type.
 *
 * @example
 * ```ts
 * listTypeName('MyType') // => "[MyType]"
 * ```
 *
 * @param typeName Type name to convert.
 *
 * @returns Type name wrapped as a list type.
 */
export const listTypeName = (typeName: string): string => `[${typeName}]`
