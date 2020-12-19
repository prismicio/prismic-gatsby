import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/Either'
import { flow } from 'fp-ts/function'

/**
 * Returns a clone of the given decoder that always succeeds using the given
 * value `a` if the original decoder fails.
 *
 * @param a Fallback value to return if the decoder fails.
 *
 * @returns Cloned decoder that always succeeds.
 */
export const withFallback = <A>(a: A) => <I>(
  decoder: D.Decoder<I, A>,
): D.Decoder<I, A> => ({
  decode: flow(
    decoder.decode,
    E.orElse(() => D.success(a)),
  ),
})

/**
 * Decoder for any function.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const func: D.Decoder<unknown, Function> = {
  decode: (u) =>
    typeof u === 'function' ? D.success(u) : D.failure(u, 'function'),
}
