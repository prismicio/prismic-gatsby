export const mapRecordIndices = <K extends string, L extends string, A>(
  f: (k: K) => L,
  r: Record<K, A>,
): Record<L, A> => {
  const result = {} as Record<L, A>

  for (const key in r) {
    result[f(key)] = r[key]
  }

  return result
}
