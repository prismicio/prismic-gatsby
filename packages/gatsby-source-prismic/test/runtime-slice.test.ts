import test from 'ava'
import * as prismicM from '@prismicio/mock'
import * as sinon from 'sinon'

import { createMockCustomTypeModelWithFields } from './__testutils__/createMockCustomTypeModelWithFields'

import * as gatsbyPrismic from '../src'

test('normalizes Slice fields', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    sliceZone: {
      ...prismicM.model.sliceZone({ seed: t.title }),
      config: {
        labels: {},
        choices: {
          slice: {
            ...prismicM.model.slice({ seed: t.title }),
            'non-repeat': {
              richText: prismicM.model.richText({ seed: t.title }),
            },
            repeat: {
              richText: prismicM.model.richText({ seed: t.title }),
            },
          },
        },
      },
    },
  })
  const document = prismicM.value.document({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  for (let i = 0; i < normalizedDocument.data.sliceZone.length; i++) {
    t.is(typeof normalizedDocument.data.sliceZone[i].id, 'string')
    t.is(
      normalizedDocument.data.sliceZone[i].__typename,
      'PrismicEMarketsDataSliceZoneSlice',
    )

    t.notThrows(() =>
      sinon.assert.match(
        normalizedDocument.data.sliceZone[i].primary.richText,
        {
          text: sinon.match.string,
          html: sinon.match.string,
          richText: document.data.sliceZone[i].primary.richText,
          raw: document.data.sliceZone[i].primary.richText,
        },
      ),
    )

    for (
      let j = 0;
      j < normalizedDocument.data.sliceZone[i].items.length;
      j++
    ) {
      t.notThrows(() =>
        sinon.assert.match(
          normalizedDocument.data.sliceZone[i].items[j].richText,
          {
            text: sinon.match.string,
            html: sinon.match.string,
            richText: document.data.sliceZone[i].items[j].richText,
            raw: document.data.sliceZone[i].items[j].richText,
          },
        ),
      )
    }
  }
})
