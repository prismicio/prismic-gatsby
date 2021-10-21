/**
 * Converts a list of path edges to a string joined by arrows ("`>`").
 *
 * @param path - List of path edges.
 *
 * @returns Paths joined by arrows ("`>`").
 */
export const arrowPath = (path: string[]): string => path.join(" > ");
