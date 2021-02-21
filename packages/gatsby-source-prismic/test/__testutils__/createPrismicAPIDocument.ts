import * as prismic from 'ts-prismic'
import md5 from 'tiny-hashes/md5'

export const createPrismicAPIDocument = <TData = Record<string, unknown>>(
  fields?: Partial<prismic.Document<TData>>,
): prismic.Document<TData> => {
  const id = md5(Math.random().toString())

  return {
    id,
    uid: id,
    url: 'url',
    type: 'type',
    href: 'href',
    tags: ['tag'],
    slugs: ['slug'],
    lang: 'lang',
    alternate_languages: [],
    first_publication_date: 'first_publication_date',
    last_publication_date: 'last_publication_date',
    ...fields,
    data: {
      ...fields?.data,
    } as TData,
  }
}
