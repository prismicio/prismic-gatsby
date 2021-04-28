import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import * as S from 'fp-ts/Semigroup'
import { flow } from 'fp-ts/function'

/**
 * Maps indices of a record with a given function.
 */
export const mapRecordIndices = <K extends string, A>(
  f: (k: K) => string,
): ((r: Record<K, A>) => Record<string, A>) =>
  flow(
    R.collect((index: K, value) => [f(index), value] as [string, A]),
    R.fromFoldable(S.last<A>(), A.Foldable),
  )
