import * as E from 'fp-ts/Either'
import { constTrue, pipe } from 'fp-ts/function'

import { isObjectPreviewRefForRepository } from './isObjectPreviewRefForRepository'

const validateObjectPreviewRef = (
  repositoryName: string,
  previewRef: string,
): E.Either<Error, boolean> =>
  pipe(
    E.tryCatch(
      () => JSON.parse(previewRef),
      (error) => error as Error,
    ),
    E.chainFirst(
      E.fromPredicate(
        isObjectPreviewRefForRepository(repositoryName),
        () => new Error('Not an object preview ref'),
      ),
    ),
    E.map(constTrue),
  )

const validateURLPreviewRef = (
  repositoryName: string,
  previewRef: string,
): E.Either<Error, boolean> =>
  pipe(
    E.tryCatch(
      () => new URL(decodeURIComponent(previewRef)),
      () => new Error(`Invalid preview token format: ${previewRef}`),
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
    E.map(constTrue),
  )

/**
 * Validate a preview token for a specific repository. Two styles of preview refs are checked:
 *
 * **New Style**: An object with the following shape:
 *
 *   {
 *     "_tracker": "someHash",
 *     "<repositoryName>.prismic.io": {
 *       "preview": "someValue"
 *     }
 *   }
 *
 * **Legacy Style**: A URL with the following format:
 *
 *   https://<repositoryName>.prismic.io/somePath
 *
 * @param repositoryName Repository name to validate against.
 * @param previewRef The preview ref to validate.
 *
 * @return An `Either` containing an error explaining why it doesn't validate, or `true`.
 */
export const validatePreviewRefForRepository = (
  repositoryName: string,
  previewRef: string,
): E.Either<Error, boolean> =>
  pipe(
    validateObjectPreviewRef(repositoryName, previewRef),
    E.orElse(() => validateURLPreviewRef(repositoryName, previewRef)),
  )
