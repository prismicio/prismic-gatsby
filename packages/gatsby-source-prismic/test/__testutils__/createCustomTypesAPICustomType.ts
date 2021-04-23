import * as crypto from 'crypto'

import { PrismicCustomTypeApiCustomType, PrismicFieldType } from '../../src'

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
        foo: { type: PrismicFieldType.Text, config: {} },
      },
    },
    ...customType,
  }
}
