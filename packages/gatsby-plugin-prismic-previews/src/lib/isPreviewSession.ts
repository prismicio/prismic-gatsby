import * as prismic from '@prismicio/client'
import * as IOE from 'fp-ts/IOEither'
import { constTrue, pipe } from 'fp-ts/function'

import { getCookie } from './getCookie'
import { extractPreviewRefRepositoryName } from './extractPreviewRefRepositoryName'

export const isPreviewSession = pipe(
  getCookie(prismic.cookie.preview),
  IOE.chain((previewRef) =>
    pipe(
      extractPreviewRefRepositoryName(previewRef),
      IOE.fromOption(
        () =>
          new Error(
            'Not a preview session (preview token does not contain a repository)',
          ),
      ),
    ),
  ),
  IOE.map(constTrue),
  IOE.mapLeft(
    () => new Error('Not a preview session (preview token does not exist)'),
  ),
)
