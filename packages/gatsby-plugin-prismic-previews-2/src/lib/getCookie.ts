import * as cookie from 'es-cookie'
import * as IOE from 'fp-ts/IOEither'
import { pipe } from 'fp-ts/function'

export const getCookie = (name: string): IOE.IOEither<Error, string> =>
  pipe(
    IOE.fromIO<Error, string>(() => cookie.get(name) as string),
    IOE.chain(
      IOE.fromPredicate(
        (x) => x != null,
        () => new Error(`Value does not exist for cookie: ${name}`),
      ),
    ),
  )
