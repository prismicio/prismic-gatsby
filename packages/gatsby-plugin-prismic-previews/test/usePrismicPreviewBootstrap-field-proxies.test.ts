import test, { ExecutionContext } from 'ava'
import * as mswNode from 'msw/node'
import * as sinon from 'sinon'
import * as gatsby from 'gatsby'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import { renderHook, act } from '@testing-library/react-hooks'
import browserEnv from 'browser-env'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createAPIQueryMockedRequest } from './__testutils__/createAPIQueryMockedRequest'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewRef } from './__testutils__/createPreviewRef'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { createTypePathsMockedRequest } from './__testutils__/createTypePathsMockedRequest'
import { polyfillKy } from './__testutils__/polyfillKy'

import {
  PluginOptions,
  PrismicPreviewProvider,
  PrismicRepositoryConfigs,
  usePrismicPreviewBootstrap,
  usePrismicPreviewContext,
} from '../src'
import { onClientEntry } from '../src/gatsby-browser'

const createRepositoryConfigs = (
  pluginOptions: PluginOptions,
): PrismicRepositoryConfigs => [
  {
    repositoryName: pluginOptions.repositoryName,
    linkResolver: (doc): string => `/${doc.uid}`,
  },
]

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()
  browserEnv(['window', 'document'])
  server.listen({ onUnhandledRequest: 'error' })
  globalThis.__PATH_PREFIX__ = 'https://example.com'
})
test.beforeEach(() => {
  clearAllCookies()
})
test.after(() => {
  server.close()
})

// Opting out of defining a return type here since this is just a test.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const performPreview = async (
  t: ExecutionContext,
  gatsbyContext: gatsby.BrowserPluginArgs,
  pluginOptions: PluginOptions,
  repositoryConfigs: PrismicRepositoryConfigs,
  queryResponse: prismic.Response.Query,
  typePathsFilename: string,
  typePaths: Record<string, gatsbyPrismic.PrismicTypePathType>,
) => {
  const ref = createPreviewRef(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, ref)

  server.use(createAPIQueryMockedRequest(pluginOptions, queryResponse, { ref }))
  server.use(createTypePathsMockedRequest(typePathsFilename, typePaths))

  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForValueToChange } = renderHook(
    () => {
      const context = usePrismicPreviewContext()
      const bootstrap = usePrismicPreviewBootstrap(repositoryConfigs)

      return { bootstrap, context }
    },
    { wrapper: PrismicPreviewProvider },
  )

  t.true(result.current.bootstrap[0].state === 'INIT')

  act(() => {
    const [, bootstrapPreview] = result.current.bootstrap
    bootstrapPreview()
  })

  await waitForValueToChange(() => result.current.bootstrap[0].state)
  t.true(result.current.bootstrap[0].state === 'BOOTSTRAPPING')

  await waitForValueToChange(() => result.current.bootstrap[0].state)
  t.true(result.current.bootstrap[0].state === 'BOOTSTRAPPED')

  return result
}

test.serial('document', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const doc = createPrismicAPIDocument()
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const result = await performPreview(
    t,
    // @ts-expect-error - Partial gatsbyContext provided
    gatsbyContext,
    pluginOptions,
    config,
    queryResponse,
    '8fc72c0f6a5f7e677994a88a89c7c333.json',
    {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
    },
  )

  const node = result.current.context[0].nodes[doc.id]

  t.true(node.url === config[0].linkResolver(doc))
})

test.serial(
  'field names with dashes are transformed with underscores by default',
  async (t) => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions(t)
    const config = createRepositoryConfigs(pluginOptions)

    // Note that we are using "structured-text" (with a dash), but the typepaths
    // below use "structured_text" (with an underscore). The transformer will
    // transformer "-" to "_" by default.
    const doc = createPrismicAPIDocument({
      'structured-text': [{ type: 'paragraph', text: 'foo' }],
    })
    const queryResponse = createPrismicAPIQueryResponse([doc])

    const result = await performPreview(
      t,
      // @ts-expect-error - Partial gatsbyContext provided
      gatsbyContext,
      pluginOptions,
      config,
      queryResponse,
      '104b34900d272bb2aa34ffc29a93afe5.json',
      {
        type: gatsbyPrismic.PrismicSpecialType.Document,
        'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
        'type.data.structured_text':
          gatsbyPrismic.PrismicFieldType.StructuredText,
      },
    )

    const node = result.current.context[0].nodes[doc.id]

    t.deepEqual(node.data.structured_text, {
      html: '<p>foo</p>',
      text: 'foo',
      raw: doc.data['structured-text'],
    })
  },
)

test.serial(
  'field names are transformed using provided transformFieldName function',
  async (t) => {
    const gatsbyContext = createGatsbyContext()
    const pluginOptions = createPluginOptions(t)
    const config = createRepositoryConfigs(pluginOptions)

    config[0].transformFieldName = (fieldName: string) =>
      fieldName.replace(/-/g, 'CUSTOM')

    // Note that we are using "structuredCUSTOMtext", but the typepaths below
    // use "structured_text" (with an underscore). The transformer will convert
    // the field name.
    const doc = createPrismicAPIDocument({
      'structured-text': [{ type: 'paragraph', text: 'foo' }],
    })
    const queryResponse = createPrismicAPIQueryResponse([doc])

    const result = await performPreview(
      t,
      // @ts-expect-error - Partial gatsbyContext provided
      gatsbyContext,
      pluginOptions,
      config,
      queryResponse,
      '2ab170ad671b4d65411bcf73ed34a421.json',
      {
        type: gatsbyPrismic.PrismicSpecialType.Document,
        'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
        'type.data.structuredCUSTOMtext':
          gatsbyPrismic.PrismicFieldType.StructuredText,
      },
    )

    const node = result.current.context[0].nodes[doc.id]

    t.deepEqual(node.data.structuredCUSTOMtext, {
      html: '<p>foo</p>',
      text: 'foo',
      raw: doc.data['structured-text'],
    })
  },
)

test.serial('structured text', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const doc = createPrismicAPIDocument({
    structured_text: [{ type: 'paragraph', text: 'foo' }],
  })
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const result = await performPreview(
    t,
    // @ts-expect-error - Partial gatsbyContext provided
    gatsbyContext,
    pluginOptions,
    config,
    queryResponse,
    '954379fb96a66a39a27fd9f39a34d214.json',
    {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
      'type.data.structured_text':
        gatsbyPrismic.PrismicFieldType.StructuredText,
    },
  )

  const node = result.current.context[0].nodes[doc.id]

  t.deepEqual(node.data.structured_text, {
    html: '<p>foo</p>',
    text: 'foo',
    raw: doc.data.structured_text,
  })
})

test.serial('link', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const linkedDoc = createPrismicAPIDocument()
  const doc = createPrismicAPIDocument({
    doc_link: { link_type: 'Document', id: linkedDoc.id, uid: linkedDoc.uid },
    media_link: { link_type: 'Media', url: 'https://example.com/image.jpg' },
  })
  const queryResponse = createPrismicAPIQueryResponse([doc, linkedDoc])

  const result = await performPreview(
    t,
    // @ts-expect-error - Partial gatsbyContext provided
    gatsbyContext,
    pluginOptions,
    config,
    queryResponse,
    '7426ae6d263497631ef63844cc225cac.json',
    {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
      'type.data.doc_link': gatsbyPrismic.PrismicFieldType.Link,
      'type.data.media_link': gatsbyPrismic.PrismicFieldType.Link,
    },
  )

  const node = result.current.context[0].nodes[doc.id]
  const linkedNode = result.current.context[0].nodes[linkedDoc.id]

  t.deepEqual(node.data.doc_link, {
    ...doc.data.doc_link,
    url: config[0].linkResolver(linkedDoc),
    localFile: null,
    raw: doc.data.doc_link,
  })

  // We must test the document field separately since it is only accessible
  // via the Proxy handler. This field doesn't actually exist in the object.
  t.true(
    (node.data.doc_link as Record<string, unknown>).document === linkedNode,
  )

  t.deepEqual(node.data.media_link, {
    ...doc.data.media_link,
    localFile: {
      publicURL: doc.data.media_link.url,
    },
    raw: doc.data.media_link,
  })
})

test.serial('image', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const doc = createPrismicAPIDocument({
    image: {
      dimensions: { width: 400, height: 300 },
      alt: 'alt',
      copyright: 'copyright',
      url: 'https://example.com/image.jpg',
      Thumb1: {
        dimensions: { width: 400, height: 300 },
        alt: 'alt',
        copyright: 'copyright',
        url: 'https://example.com/thumb1.jpg',
      },
      Thumb2: {
        dimensions: { width: 400, height: 300 },
        alt: 'alt',
        copyright: 'copyright',
        url: 'https://example.com/thumb2.jpg',
      },
    },
  })
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const result = await performPreview(
    t,
    // @ts-expect-error - Partial gatsbyContext provided
    gatsbyContext,
    pluginOptions,
    config,
    queryResponse,
    '74f723ca5fab771b7a6273d8da3c5d77.json',
    {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
      'type.data.image': gatsbyPrismic.PrismicFieldType.Image,
    },
  )

  const node = result.current.context[0].nodes[doc.id]

  const fixedFields = {
    width: sinon.match.number,
    height: sinon.match.number,
    src: sinon.match.string,
    srcSet: sinon.match.string,
    base64: sinon.match.string,
    srcWebp: sinon.match.string,
    srcSetWebp: sinon.match.string,
  }

  const fluidFields = {
    aspectRatio: sinon.match.number,
    src: sinon.match.string,
    srcSet: sinon.match.string,
    sizes: sinon.match.string,
    base64: sinon.match.string,
    srcWebp: sinon.match.string,
    srcSetWebp: sinon.match.string,
  }

  const localFileFields = {
    childImageSharp: {
      fixed: fixedFields,
      fluid: fluidFields,
    },
  }

  t.notThrows(() =>
    sinon.assert.match(
      node.data.image,
      sinon.match({
        dimensions: doc.data.image.dimensions,
        alt: doc.data.image.alt,
        copyright: doc.data.image.copyright,
        url: doc.data.image.url,
        fixed: fixedFields,
        fluid: fluidFields,
        localFile: localFileFields,
        thumbnails: {
          Thumb1: {
            ...doc.data.image.Thumb1,
            fixed: fixedFields,
            fluid: fluidFields,
            localFile: localFileFields,
          },
          Thumb2: {
            ...doc.data.image.Thumb2,
            fixed: fixedFields,
            fluid: fluidFields,
            localFile: localFileFields,
          },
        },
      }),
    ),
  )
})

test.serial('group', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const doc = createPrismicAPIDocument({
    group: [
      { structured_text: [{ type: 'paragraph', text: 'foo' }] },
      { structured_text: [{ type: 'paragraph', text: 'bar' }] },
    ],
  })
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const result = await performPreview(
    t,
    // @ts-expect-error - Partial gatsbyContext provided
    gatsbyContext,
    pluginOptions,
    config,
    queryResponse,
    '8c94ede38e3b7d86b3779926fbf93d29.json',
    {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
      'type.data.group': gatsbyPrismic.PrismicFieldType.Group,
      'type.data.group.structured_text':
        gatsbyPrismic.PrismicFieldType.StructuredText,
    },
  )

  const node = result.current.context[0].nodes[doc.id]

  t.deepEqual(node.data.group, [
    {
      structured_text: {
        html: '<p>foo</p>',
        text: 'foo',
        raw: doc.data.group[0].structured_text,
      },
    },
    {
      structured_text: {
        html: '<p>bar</p>',
        text: 'bar',
        raw: doc.data.group[1].structured_text,
      },
    },
  ])
})

test.serial('slices', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions(t)
  const config = createRepositoryConfigs(pluginOptions)

  const doc = createPrismicAPIDocument({
    slices: [
      {
        slice_type: 'foo',
        primary: { structured_text: [{ type: 'paragraph', text: 'foo' }] },
      },
      {
        slice_type: 'bar',
        items: [
          { structured_text: [{ type: 'paragraph', text: 'foo' }] },
          { structured_text: [{ type: 'paragraph', text: 'bar' }] },
        ],
      },
    ],
  })
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const result = await performPreview(
    t,
    // @ts-expect-error - Partial gatsbyContext provided
    gatsbyContext,
    pluginOptions,
    config,
    queryResponse,
    '8701c50f7225950d72eecd7d6fff402d.json',
    {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
      'type.data.slices': gatsbyPrismic.PrismicFieldType.Slices,
      'type.data.slices.foo': gatsbyPrismic.PrismicFieldType.Slice,
      'type.data.slices.foo.primary.structured_text':
        gatsbyPrismic.PrismicFieldType.StructuredText,
      'type.data.slices.bar': gatsbyPrismic.PrismicFieldType.Slice,
      'type.data.slices.bar.items.structured_text':
        gatsbyPrismic.PrismicFieldType.StructuredText,
    },
  )

  const node = result.current.context[0].nodes[doc.id]

  // The `id` values will change if the content of the slices changes. It's
  // okay to update this value in the test as needed, but ensure the values
  // are unique between all slices in the array.
  t.deepEqual(node.data.slices, [
    {
      id: '95a74515ba477142af5ef01d6325b04b',
      slice_type: 'foo',
      primary: {
        structured_text: {
          html: '<p>foo</p>',
          text: 'foo',
          raw: doc.data.slices[0].primary?.structured_text,
        },
      },
      items: [],
    },
    {
      id: 'e07c44a80a6a422612456328100ceed9',
      slice_type: 'bar',
      primary: {},
      items: [
        {
          structured_text: {
            html: '<p>foo</p>',
            text: 'foo',
            raw: doc.data.slices[1].items?.[0].structured_text,
          },
        },
        {
          structured_text: {
            html: '<p>bar</p>',
            text: 'bar',
            raw: doc.data.slices[1].items?.[1].structured_text,
          },
        },
      ],
    },
  ])
})
