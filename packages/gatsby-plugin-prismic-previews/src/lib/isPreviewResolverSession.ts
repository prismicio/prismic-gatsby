import * as IOE from 'fp-ts/IOEither'
import { pipe } from 'fp-ts/function'

import { isPreviewSession } from './isPreviewSession'
import { getURLSearchParam } from './getURLSearchParam'

export const isPreviewResolverSession = pipe(
  isPreviewSession,
  IOE.chain(() =>
    pipe(
      getURLSearchParam('documentId'),
      IOE.fromOption(
        () =>
          new Error(
            'Not a preview resolver session (documentId URL parameter not present)',
          ),
      ),
    ),
  ),
)
