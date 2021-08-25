import test from 'ava'
import * as prismicT from '@prismicio/types'
import * as prismicH from '@prismicio/helpers'
import * as prismicM from '@prismicio/mock'

import { createMockCustomTypeModelWithFields } from './__testutils__/createMockCustomTypeModelWithFields'

import * as gatsbyPrismic from '../src'

test('normalizes Rich Text fields', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    richText: prismicM.model.richText({ seed: t.title }),
  })
  const document = prismicM.value.document({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  t.is(
    normalizedDocument.data.richText.text,
    prismicH.asText(document.data.richText),
  )
  t.is(
    normalizedDocument.data.richText.html,
    prismicH.asHTML(document.data.richText),
  )
  t.is(normalizedDocument.data.richText.richText, document.data.richText)
  t.is(normalizedDocument.data.richText.raw, document.data.richText)
})

test('uses Link Resolver for html field if one is provided to the runtime', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    richText: prismicM.model.richText({ seed: t.title }),
  })
  const document = prismicM.value.document({
    seed: t.title,
    model,
  })
  document.data.richText = [
    {
      type: prismicT.RichTextNodeType.heading1,
      text: 'This text will be linked',
      spans: [
        {
          type: prismicT.RichTextNodeType.hyperlink,
          start: 0,
          end: 24,
          data: {
            link_type: prismicT.LinkType.Document,
            id: document.id,
            uid: document.uid ?? undefined,
            lang: document.lang,
            tags: document.tags,
            type: document.type,
          },
        },
      ],
    },
  ]

  const linkResolver: prismicH.LinkResolverFunction = (doc) => `/${doc.uid}`
  const runtime = gatsbyPrismic.createRuntime({ linkResolver })
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  t.is(
    normalizedDocument.data.richText.html,
    prismicH.asHTML(document.data.richText, linkResolver),
  )
})

test('uses HTML Serializer for html field if one is provided to the runtime', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    richText: prismicM.model.richText({ seed: t.title }),
  })
  const document = prismicM.value.document({
    seed: t.title,
    model,
  })
  document.data.richText = [
    {
      type: prismicT.RichTextNodeType.heading1,
      text: 'heading1',
      spans: [],
    },
  ]

  const htmlSerializer = {
    heading1: () => 'serialized',
  }
  const runtime = gatsbyPrismic.createRuntime({ htmlSerializer })
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  t.is(
    normalizedDocument.data.richText.html,
    prismicH.asHTML(document.data.richText, undefined, htmlSerializer),
  )
})
