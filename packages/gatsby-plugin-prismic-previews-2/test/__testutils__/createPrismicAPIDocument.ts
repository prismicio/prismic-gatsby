import { PrismicAPIDocument, UnknownRecord } from '../../src'

export const createPrismicAPIDocument = <TData extends UnknownRecord<string>>(
  data: TData = {} as TData,
): PrismicAPIDocument<TData> => ({
  id: 'id',
  uid: 'uid',
  url: 'url',
  type: 'type',
  href: 'href',
  tags: ['tag'],
  slugs: ['slug'],
  lang: 'lang',
  alternate_languages: [],
  first_publication_date: 'first_publication_date',
  last_publication_date: 'last_publication_date',
  data,
})
