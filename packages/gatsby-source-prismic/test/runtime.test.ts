import test, { ExecutionContext } from 'ava'
import * as prismicT from '@prismicio/types'
import * as mock from '@prismicio/mock'

import { createRuntime } from '../src/runtime'

// const createAllFieldForGroupModels = (
//   t: ExecutionContext,
// ): Record<string, prismicT.CustomTypeModelFieldForGroup> => ({
//   boolean: mock.model.boolean({ seed: t.title }),
//   color: mock.model.color({ seed: t.title }),
//   contentRelationship: mock.model.contentRelationship({ seed: t.title }),
//   date: mock.model.date({ seed: t.title }),
//   embed: mock.model.embed({ seed: t.title }),
//   geoPoint: mock.model.geoPoint({ seed: t.title }),
//   image: mock.model.image({ seed: t.title }),
//   integrationFields: mock.model.integrationFields({ seed: t.title }),
//   keyText: mock.model.keyText({ seed: t.title }),
//   link: mock.model.link({ seed: t.title }),
//   linkToMedia: mock.model.linkToMedia({ seed: t.title }),
//   number: mock.model.number({ seed: t.title }),
//   richText: mock.model.richText({ seed: t.title }),
//   select: mock.model.select({ seed: t.title }),
//   timestamp: mock.model.timestamp({ seed: t.title }),
//   title: mock.model.title({ seed: t.title }),
// })

test('normalizes a document', (t) => {
  const model = mock.model.customType({
    seed: t.title,
    tabsCount: 1,
    configs: {
      boolean: { count: 1 },
      color: { count: 1 },
      contentRelationship: { count: 1 },
      date: { count: 1 },
      embed: { count: 1 },
      geoPoint: { count: 1 },
      image: { count: 1 },
      integrationFields: { count: 1 },
      keyText: { count: 1 },
      link: { count: 1 },
      linkToMedia: { count: 1 },
      number: { count: 1 },
      richText: { count: 1 },
      select: { count: 1 },
      timestamp: { count: 1 },
      title: { count: 1 },
    },
    withUID: true,
    withSliceZones: true,
  })
  const document = mock.value.document({ model })

  const runtime = createRuntime()
  runtime.registerCustomTypeModels([model])
  runtime.registerDocument(document)

  t.snapshot(runtime.getNode(document.id))
})
