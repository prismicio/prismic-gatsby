import test from 'ava'
import * as prismicT from '@prismicio/types'
import * as mock from '@prismicio/mock'

import { createRuntime } from '../src/runtime'

test('normalizes a document', (t) => {
  const model = {
    id: 'page',
    label: 'Page',
    status: true,
    repeatable: true,
    json: {
      Main: {
        boolean: mock.model.boolean(),
        color: mock.model.color(),
        contentRelationship: mock.model.contentRelationship(),
        date: mock.model.date(),
        embed: mock.model.embed(),
        geoPoint: mock.model.geoPoint(),
        image: mock.model.image(),
        integrationFields: mock.model.integrationFields(),
        keyText: mock.model.keyText(),
        link: mock.model.link(),
        linkToMedia: mock.model.linkToMedia(),
        number: mock.model.number(),
        richText: mock.model.richText(),
        select: mock.model.select(),
        timestamp: mock.model.timestamp(),
        title: mock.model.title(),
        group: {
          type: prismicT.CustomTypeModelFieldType.Group,
          config: {
            label: 'Group',
            fields: {
              boolean: mock.model.boolean(),
              color: mock.model.color(),
              contentRelationship: mock.model.contentRelationship(),
              date: mock.model.date(),
              embed: mock.model.embed(),
              geoPoint: mock.model.geoPoint(),
              image: mock.model.image(),
              integrationFields: mock.model.integrationFields(),
              keyText: mock.model.keyText(),
              link: mock.model.link(),
              linkToMedia: mock.model.linkToMedia(),
              number: mock.model.number(),
              richText: mock.model.richText(),
              select: mock.model.select(),
              timestamp: mock.model.timestamp(),
              title: mock.model.title(),
            },
          },
        },
      },
    },
  } as const
  const document = mock.value.document({ model })

  const runtime = createRuntime()
  runtime.registerCustomTypeModels([model])

  const normalizedDocument = runtime.registerDocument(document)
  t.log(normalizedDocument.data.contentRelationship)
})
