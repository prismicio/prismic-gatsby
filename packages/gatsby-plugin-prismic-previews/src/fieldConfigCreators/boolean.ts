import * as RTE from 'fp-ts/ReaderTaskEither'
import { FieldConfigCreator } from 'gatsby-source-prismic/dist/types'

export const createBooleanFieldConfig: FieldConfigCreator = () =>
  RTE.of('Boolean')
