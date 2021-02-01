import * as cookie from 'es-cookie'
import * as IO from 'fp-ts/IO'

export const setCookie = (name: string, value: string): IO.IO<void> => () =>
  cookie.set(name, value)
