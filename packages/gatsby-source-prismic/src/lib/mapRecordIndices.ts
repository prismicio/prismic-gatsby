import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import * as S from 'fp-ts/Semigroup'
import { flow } from 'fp-ts/function'

/**
 * Maps indices of a record with a given function.
 *
 * @param f Function mapping an index to a new index.
 *
 * @returns A function that accepts a record to be updated.
 */
export const mapRecordIndices = <K extends string, A>(
  f: (k: K) => string,
): ((r: Record<K, A>) => Record<string, A>) =>
  flow(
    R.collect((index: K, value) => [f(index), value] as [string, A]),
    R.fromFoldable(S.last<A>(), A.Foldable),
  )
