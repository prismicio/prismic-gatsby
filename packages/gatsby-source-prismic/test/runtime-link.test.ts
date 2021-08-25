import test from 'ava'
import * as prismicH from '@prismicio/helpers'
import * as prismicM from '@prismicio/mock'
import * as sinon from 'sinon'

import { createMockCustomTypeModelWithFields } from './__testutils__/createMockCustomTypeModelWithFields'

import * as gatsbyPrismic from '../src'

test('normalizes Link fields', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    link: prismicM.model.link({ seed: t.title }),
  })
  const document = prismicM.value.document({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  if ('url' in document.data.link && 'url' in normalizedDocument.data.link) {
    t.is(normalizedDocument.data.link.url, prismicH.asLink(document.data.link))
    t.is(normalizedDocument.data.link.raw, document.data.link)
    t.notThrows(() =>
      sinon.assert.match(
        normalizedDocument.data.link,
        sinon.match(document.data.link),
      ),
    )
  } else {
    t.fail()
  }
})

test('uses Link Resolver for url field if one is provided to the runtime', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    link: prismicM.model.link({ seed: t.title }),
  })
  const document = prismicM.value.document({
    seed: t.title,
    model,
    withURL: false,
  })
  document.data.link = prismicM.value.contentRelationship({
    seed: t.title,
    linkableDocuments: [document],
  })

  const linkResolver: prismicH.LinkResolverFunction = (doc) => `/${doc.uid}`
  const runtime = gatsbyPrismic.createRuntime({ linkResolver })
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  if ('url' in normalizedDocument.data.link) {
    t.is(
      normalizedDocument.data.link.url,
      prismicH.asLink(document.data.link, linkResolver),
    )
  } else {
    t.fail()
  }
})
