import * as crypto from 'crypto'
import * as prismicT from '@prismicio/types'

import { createCustomTypesAPISharedSliceVariation } from './createCustomTypeSharedSliceVariation'

export const createCustomTypesAPISharedSlice = (
  sharedSlice?: Partial<prismicT.SharedSliceModel>,
): prismicT.SharedSliceModel => {
  const id = crypto
    .createHash('md5')
    .update(Math.random().toString())
    .digest('hex')

  return {
    type: prismicT.CustomTypeModelSliceType.SharedSlice,
    id: id,
    name: id,
    description: 'description',
    variations: [createCustomTypesAPISharedSliceVariation()],
    ...sharedSlice,
  }
}
