import test from 'ava'
import * as prismicM from '@prismicio/mock'
import * as prismicH from '@prismicio/helpers'

import * as gatsbyPrismic from '../src'

test('normalizes documents', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.document({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  t.is(normalizedDocument.__typename, 'PrismicSynergies')
  t.is(normalizedDocument._previewable, document.id)

  t.is(normalizedDocument.url, prismicH.documentAsLink(document))

  t.is(typeof normalizedDocument.id, 'string')
  t.is(normalizedDocument.prismicId, document.id)

  t.is(normalizedDocument.internal.type, 'PrismicSynergies')
  t.is(typeof normalizedDocument.internal.contentDigest, 'string')
})
