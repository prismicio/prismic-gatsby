import { ExecutionContext } from 'ava'
import * as prismicM from '@prismicio/mock'

export const createAllNamedMockFieldModels = (t: ExecutionContext) => ({
  boolean: prismicM.model.boolean({ seed: t.title }),
  color: prismicM.model.color({ seed: t.title }),
  contentRelationship: prismicM.model.contentRelationship({ seed: t.title }),
  date: prismicM.model.date({ seed: t.title }),
  embed: prismicM.model.embed({ seed: t.title }),
  geoPoint: prismicM.model.geoPoint({ seed: t.title }),
  image: prismicM.model.image({ seed: t.title }),
  integrationFields: prismicM.model.integrationFields({ seed: t.title }),
  keyText: prismicM.model.keyText({ seed: t.title }),
  link: prismicM.model.link({ seed: t.title }),
  linkToMedia: prismicM.model.linkToMedia({ seed: t.title }),
  number: prismicM.model.number({ seed: t.title }),
  richText: prismicM.model.richText({ seed: t.title }),
  select: prismicM.model.select({ seed: t.title }),
  timestamp: prismicM.model.timestamp({ seed: t.title }),
  title: prismicM.model.title({ seed: t.title }),
})
