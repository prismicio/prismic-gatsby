import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export const validatePreviewTokenForRepository = (
  repositoryName: string,
  token: string,
): E.Either<Error, true> =>
  pipe(
    E.tryCatch(
      () => new URL(decodeURIComponent(token)),
      () => new Error(`Invalid preview token format: ${token}`),
    ),
    E.chain(
      E.fromPredicate(
        (url) => url.host === `${repositoryName}.prismic.io`,
        () =>
          new Error(
            `Preview token is not for this repository: ${repositoryName}`,
          ),
      ),
    ),
    E.map(() => true),
  )
