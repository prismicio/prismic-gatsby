import * as crypto from 'crypto'
import * as prismicT from '@prismicio/types'

import { PrismicCustomTypeApiCustomType } from '../../src'

export const createCustomTypesAPICustomType = (
  customType?: Partial<PrismicCustomTypeApiCustomType>,
): PrismicCustomTypeApiCustomType => {
  const id = crypto
    .createHash('md5')
    .update(Math.random().toString())
    .digest('hex')

  return {
    id: id,
    label: id,
    repeatable: true,
    json: {
      Main: {
        foo: {
          type: prismicT.CustomTypeModelFieldType.Text,
          config: { label: 'Foo' },
        },
      },
    },
    ...customType,
  }
}
