import * as gatsby from 'gatsby'
import * as R from 'fp-ts/ReadonlyRecord'
import * as S from 'fp-ts/Semigroup'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

import fixtureSchema from './__fixtures__/schema.json'

enum PrismicFieldType {
  StructuredText,
  UID,
  Text,
}

type PrismicFieldSchema =
  | {
      type: PrismicFieldType.UID
      config: {
        label?: string
      }
    }
  | {
      type: PrismicFieldType.StructuredText | PrismicFieldType.Text
      config: {
        label?: string
        placeholder?: string
      }
    }

const fieldSchemaToGatsbyGraphQLType = (
  schema: PrismicFieldSchema,
): gatsby.GatsbyGraphQLType => {
  gatsby.sch
}

test('schemaToTypeDef', () => {
  const res = pipe(
    fixtureSchema,
    R.fromRecord,
    R.collect((_, value) => value),
    S.fold(S.getObjectSemigroup<Record<string, PrismicFieldSchema>>())({}),
    R.map(fieldSchemaToGatsbyGraphQLType),
    // R.partitionWithIndex((i) => i !== 'uid'),
    // E.bimap(fieldSchemaToGatsbyGraphQLType, fieldSchemaToGatsbyGraphQLType),
  )

  console.log(res)
})
