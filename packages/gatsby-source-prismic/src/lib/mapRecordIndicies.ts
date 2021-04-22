import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import * as S from 'fp-ts/Semigroup'
import { flow } from 'fp-ts/function'

export const mapRecordIndicies = <K extends string, A>(
  f: (k: K) => string,
): ((r: Record<K, A>) => Record<string, A>) =>
  flow(
    R.collect((index: K, value) => [f(index), value] as [string, A]),
    (pairs) =>
      R.fromFoldableMap(S.last<A>(), A.Foldable)(pairs, ([index, value]) => [
        index,
        value,
      ]),
  )
