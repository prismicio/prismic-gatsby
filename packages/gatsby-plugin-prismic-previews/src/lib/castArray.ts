export const castArray = <T>(a: T | T[]): T[] => (Array.isArray(a) ? a : [a])
