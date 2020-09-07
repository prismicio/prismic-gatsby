import * as D from 'io-ts/Decoder'
import * as E from 'fp-ts/Either'
import { flow } from 'fp-ts/function'

export const withFallback = <A>(a: A) => <I>(
  decoder: D.Decoder<I, A>,
): D.Decoder<I, A> => ({
  decode: flow(
    decoder.decode,
    E.orElse(() => D.success(a)),
  ),
})

// eslint-disable-next-line @typescript-eslint/ban-types
export const func: D.Decoder<unknown, Function> = {
  decode: (u) =>
    typeof u === 'function' ? D.success(u) : D.failure(u, 'function'),
}
