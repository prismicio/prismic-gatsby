import * as prismic from 'ts-prismic'
import md5 from 'tiny-hashes/md5'

const createId = () => md5(Math.random().toString())

export const createPrismicAPIDocument = <TData = Record<string, unknown>>(
  data: TData = {} as TData,
): prismic.Document<TData> => {
  const id = createId()

  return {
    id,
    uid: id,
    url: `/${id}`,
    type: 'type',
    href: 'href',
    tags: ['tag'],
    slugs: ['slug'],
    lang: 'lang',
    alternate_languages: [],
    first_publication_date: 'first_publication_date',
    last_publication_date: 'last_publication_date',
    data,
  }
}
