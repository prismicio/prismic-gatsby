import * as cookie from 'es-cookie'
import * as O from 'fp-ts/Option'

export const getCookie = (name: string): O.Option<string> =>
  O.fromNullable(cookie.get(name))
