import test, { ExecutionContext } from 'ava'
import * as msw from 'msw'
import * as mswNode from 'msw/node'
import * as sinon from 'sinon'
import * as gatsby from 'gatsby'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as prismic from 'ts-prismic'
import * as cookie from 'es-cookie'
import { renderHook, act } from '@testing-library/react-hooks'
import browserEnv from 'browser-env'

import { clearAllCookies } from './__testutils__/clearAllCookies'
import { createGatsbyContext } from './__testutils__/createGatsbyContext'
import { createPluginOptions } from './__testutils__/createPluginOptions'
import { createPreviewToken } from './__testutils__/createPreviewToken'
import { createPrismicAPIDocument } from './__testutils__/createPrismicAPIDocument'
import { createPrismicAPIQueryResponse } from './__testutils__/createPrismicAPIQueryResponse'
import { polyfillKy } from './__testutils__/polyfillKy'
import { resolveURL } from './__testutils__/resolveURL'

import {
  PluginOptions,
  PrismicPreviewProvider,
  UsePrismicPreviewBootstrapConfig,
  usePrismicPreviewBootstrap,
  usePrismicPreviewContext,
} from '../src'
import { onClientEntry } from '../src/gatsby-browser'

const createConfig = (): UsePrismicPreviewBootstrapConfig => ({
  linkResolver: (doc): string => `/${doc.uid}`,
})

const server = mswNode.setupServer()
test.before(() => {
  polyfillKy()

  server.listen({ onUnhandledRequest: 'error' })

  browserEnv(['window', 'document'])

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
  config: UsePrismicPreviewBootstrapConfig,
  queryResponse: prismic.Response.Query,
  typePaths: Record<string, gatsbyPrismic.PrismicTypePathType>,
) => {
  const token = createPreviewToken(pluginOptions.repositoryName)
  cookie.set(prismic.cookie.preview, token)

  server.use(
    msw.rest.get(
      resolveURL(pluginOptions.apiEndpoint, './documents/search'),
      (req, res, ctx) =>
        req.url.searchParams.get('access_token') ===
          pluginOptions.accessToken &&
        req.url.searchParams.get('ref') === token &&
        req.url.searchParams.get('lang') === pluginOptions.lang &&
        req.url.searchParams.get('graphQuery') === pluginOptions.graphQuery &&
        req.url.searchParams.get('page') === '1' &&
        req.url.searchParams.get('pageSize') === '100'
          ? res(ctx.json(queryResponse))
          : res(ctx.status(401)),
    ),
  )

  server.use(
    msw.rest.get(
      resolveURL(
        globalThis.__PATH_PREFIX__,
        '/static/9e387d94c04ebf0e369948edd9c66d2b.json',
      ),
      (_req, res, ctx) => res(ctx.json(typePaths)),
    ),
  )

  await onClientEntry(gatsbyContext, pluginOptions)
  const { result, waitForValueToChange } = renderHook(
    () => {
      const context = usePrismicPreviewContext(pluginOptions.repositoryName)
      const bootstrap = usePrismicPreviewBootstrap(
        pluginOptions.repositoryName,
        config,
      )

      return { bootstrap, context }
    },
    { wrapper: PrismicPreviewProvider },
  )
  const bootstrapPreview = result.current.bootstrap[1]

  t.true(result.current.bootstrap[0].state === 'INIT')

  act(() => {
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
  const pluginOptions = createPluginOptions()
  const config = createConfig()

  const doc = createPrismicAPIDocument()
  const queryResponse = createPrismicAPIQueryResponse([doc])

  const result = await performPreview(
    t,
    // @ts-expect-error - Partial gatsbyContext provided
    gatsbyContext,
    pluginOptions,
    config,
    queryResponse,
    {
      type: gatsbyPrismic.PrismicSpecialType.Document,
      'type.data': gatsbyPrismic.PrismicSpecialType.DocumentData,
    },
  )

  const node = result.current.context[0].nodes[doc.id]

  t.true(node.url === config.linkResolver(doc))
})

test.serial('structured text', async (t) => {
  const gatsbyContext = createGatsbyContext()
  const pluginOptions = createPluginOptions()
  const config = createConfig()

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
  const pluginOptions = createPluginOptions()
  const config = createConfig()

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
    url: config.linkResolver(linkedDoc),
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
  const pluginOptions = createPluginOptions()
  const config = createConfig()

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
  const pluginOptions = createPluginOptions()
  const config = createConfig()

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
  const pluginOptions = createPluginOptions()
  const config = createConfig()

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
