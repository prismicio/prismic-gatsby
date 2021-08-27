import { ExecutionContext } from 'ava'
import * as prismicT from '@prismicio/types'
import * as prismicM from '@prismicio/mock'

import { createAllNamedMockFieldModels } from './createAllNamedMockFieldModels'

export const createMockKitchenSinkSharedSliceModel = (
  t: ExecutionContext,
): prismicT.SharedSliceModel => {
  return {
    ...prismicM.model.sharedSlice({
      seed: t.title,
      variationsCount: 0,
    }),
    id: 'sharedSlice',
    variations: [
      {
        ...prismicM.model.sharedSliceVariation({ seed: t.title }),
        primary: createAllNamedMockFieldModels(t),
        items: createAllNamedMockFieldModels(t),
      },
      {
        ...prismicM.model.sharedSliceVariation({ seed: t.title }),
        primary: createAllNamedMockFieldModels(t),
        items: createAllNamedMockFieldModels(t),
      },
    ],
  }
}
