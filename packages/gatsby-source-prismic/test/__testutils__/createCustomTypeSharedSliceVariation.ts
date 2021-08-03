import * as crypto from 'crypto'
import * as prismicT from '@prismicio/types'

export const createCustomTypesAPISharedSliceVariation = (
  sharedSliceVariation?: Partial<prismicT.SharedSliceModelVariation>,
): prismicT.SharedSliceModelVariation => {
  const id = crypto
    .createHash('md5')
    .update(Math.random().toString())
    .digest('hex')

  return {
    id: id,
    name: id,
    description: 'description',
    docURL: 'docURL',
    version: 'version',
    items: {},
    primary: {},
    ...sharedSliceVariation,
  }
}
