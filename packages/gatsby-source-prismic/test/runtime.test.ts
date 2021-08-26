import test, { ExecutionContext } from 'ava'
import * as prismicM from '@prismicio/mock'
import * as sinon from 'sinon'

import { createMockCustomTypeModelWithFields } from './__testutils__/createMockCustomTypeModelWithFields'

import * as gatsbyPrismic from '../src'

const createAllNamedFieldModels = (t: ExecutionContext) => ({
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

const createKitchenSinkCustomTypeModel = (t: ExecutionContext) => {
  return createMockCustomTypeModelWithFields(t, {
    ...createAllNamedFieldModels(t),
    group: {
      ...prismicM.model.group({ seed: t.title }),
      config: {
        label: 'Group',
        fields: createAllNamedFieldModels(t),
      },
    },
    sliceZone: {
      ...prismicM.model.sliceZone({ seed: t.title }),
      config: {
        labels: {},
        choices: {
          slice: {
            ...prismicM.model.slice({ seed: t.title }),
            'non-repeat': createAllNamedFieldModels(t),
            repeat: createAllNamedFieldModels(t),
          },
          sharedSlice: prismicM.model.sharedSliceChoice(),
        },
      },
    },
  })
}

const createKitchenSinkSharedSliceModel = (t: ExecutionContext) => {
  return {
    ...prismicM.model.sharedSlice({
      seed: t.title,
      variationsCount: 0,
    }),
    id: 'sharedSlice',
    variations: [
      {
        ...prismicM.model.sharedSliceVariation({ seed: t.title }),
        primary: createAllNamedFieldModels(t),
        items: createAllNamedFieldModels(t),
      },
      {
        ...prismicM.model.sharedSliceVariation({ seed: t.title }),
        primary: createAllNamedFieldModels(t),
        items: createAllNamedFieldModels(t),
      },
    ],
  }
}

test('createRuntime creates a Runtime instance with default config', (t) => {
  const runtime = gatsbyPrismic.createRuntime()

  t.true(runtime instanceof gatsbyPrismic.Runtime)
  t.is(runtime.config.transformFieldName('field-name'), 'field_name')
  t.deepEqual(runtime.config.imageImgixParams, {
    auto: 'compress,format',
    fit: 'max',
    q: 50,
  })
  t.deepEqual(runtime.config.imagePlaceholderImgixParams, {
    w: 100,
    blur: 15,
  })
  t.is(runtime.config.typePrefix, undefined)
  t.is(runtime.config.linkResolver, undefined)
  t.is(runtime.config.htmlSerializer, undefined)
})

test('config can be passed on creation', (t) => {
  const config: gatsbyPrismic.RuntimeConfig = {
    typePrefix: 'typePrefix',
    linkResolver: (doc) => `/${doc.uid}`,
    htmlSerializer: { heading1: () => 'heading1' },
    imageImgixParams: { q: 50 },
    imagePlaceholderImgixParams: { q: 30 },
    transformFieldName: (fieldName) => fieldName,
  }
  const runtime = gatsbyPrismic.createRuntime(config)

  t.deepEqual(runtime.config, config)
})

test('registering a custom type model adds its type paths', (t) => {
  const model = createKitchenSinkCustomTypeModel(t)

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  t.snapshot(runtime.typePaths)
})

test('multiple custom type models can be registered at once', (t) => {
  const model1 = createKitchenSinkCustomTypeModel(t)
  const model2 = createKitchenSinkCustomTypeModel(t)

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModels([model1, model2])

  t.snapshot(runtime.typePaths)
})

test('registering a shared slice model adds its type paths', (t) => {
  const model = createKitchenSinkSharedSliceModel(t)

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerSharedSliceModel(model)

  t.snapshot(runtime.typePaths)
})

test('multiple shared slice models can be registered at once', (t) => {
  const model1 = createKitchenSinkSharedSliceModel(t)
  const model2 = createKitchenSinkSharedSliceModel(t)

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerSharedSliceModels([model1, model2])

  t.snapshot(runtime.typePaths)
})

test('type paths can be registered directly', (t) => {
  const typePaths: gatsbyPrismic.TypePath[] = [
    {
      kind: gatsbyPrismic.TypePathKind.CustomType,
      path: ['foo'],
      type: gatsbyPrismic.PrismicSpecialType.Document,
    },
    {
      kind: gatsbyPrismic.TypePathKind.SharedSliceVariation,
      path: ['bar', 'baz'],
      type: gatsbyPrismic.PrismicSpecialType.SharedSliceVariation,
    },
  ]

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerTypePaths(typePaths)

  t.deepEqual(runtime.typePaths, typePaths)
})

test("registering a document adds a normalized version to the runtime's nodes", (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)
  runtime.registerDocument(document)

  t.true(runtime.nodes.some((node) => node.prismicId === document.id))
})

test('multiple documents can be registered at once', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document1 = prismicM.value.customType({
    seed: t.title,
    model,
  })
  const document2 = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)
  runtime.registerDocuments([document1, document2])

  t.is(
    runtime.nodes.filter((node) =>
      [document1.id, document2.id].includes(node.prismicId),
    ).length,
    2,
  )
})

test('registering a document returns its normalized version', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  t.is(normalizedDocument.prismicId, document.id)
})

test('normalizeDocument normalizes a document', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.normalizeDocument(document)

  t.is(normalizedDocument.prismicId, document.id)
})

test('normalize normalizes a value at the given path', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    richText: prismicM.model.richText({ seed: t.title }),
  })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalized = runtime.normalize(document.data.richText, [
    document.type,
    'data',
    'richText',
  ])

  t.notThrows(() =>
    sinon.assert.match(normalized, {
      text: sinon.match.string,
      html: sinon.match.string,
      richText: document.data.richText,
      raw: document.data.richText,
    }),
  )
})

test('throws during normalization if a type path was not registered', (t) => {
  const model = createMockCustomTypeModelWithFields(t, {
    richText: prismicM.model.richText({ seed: t.title }),
  })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()

  t.throws(() => runtime.registerDocument(document), {
    message: /no type for path/i,
  })
})

test('getNode returns a registered document by its Prismic ID', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)

  const normalizedDocument = runtime.registerDocument(document)

  t.is(runtime.getNode(document.id), normalizedDocument)
})

test('hasNode determines if a document is registered by its Prismic ID', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)
  runtime.registerDocument(document)

  t.true(runtime.hasNode(document.id))
  t.false(runtime.hasNode('non-existant-id'))
})

test('getTypePath returns a type path for a set of parameters', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()
  runtime.registerCustomTypeModel(model)
  runtime.registerDocument(document)

  t.deepEqual(runtime.getTypePath([document.type]), {
    kind: gatsbyPrismic.TypePathKind.CustomType,
    path: [document.type],
    type: gatsbyPrismic.PrismicSpecialType.Document,
  })
})

test('subscribers are notified as a result of actions', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()

  const callback = sinon.stub()
  runtime.subscribe(callback)

  runtime.registerCustomTypeModel(model)
  runtime.registerDocument(document)

  t.is(callback.callCount, 2)
})

test('subscribers can unsubscribe', (t) => {
  const model = prismicM.model.customType({ seed: t.title })
  const document1 = prismicM.value.customType({
    seed: t.title,
    model,
  })
  const document2 = prismicM.value.customType({
    seed: t.title,
    model,
  })

  const runtime = gatsbyPrismic.createRuntime()

  const callback = sinon.stub()
  runtime.subscribe(callback)

  runtime.registerCustomTypeModel(model)
  runtime.registerDocument(document1)

  runtime.unsubscribe(callback)

  runtime.registerDocument(document2)

  t.is(callback.callCount, 2)
})
