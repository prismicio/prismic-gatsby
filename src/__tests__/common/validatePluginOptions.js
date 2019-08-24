import { validatePluginOptions } from '../../common/validatePluginOptions'

const linkResolverReturnValue = 'result of linkResolver'
const linkResolver = jest.fn().mockReturnValue(() => linkResolverReturnValue)

const pathResolverReturnValue = 'result of pathResolver'
const pathResolver = jest.fn().mockReturnValue(() => pathResolverReturnValue)

const htmlSerializerReturnValue = 'result of htmlSerializer'
const htmlSerializer = jest
  .fn()
  .mockReturnValue(() => htmlSerializerReturnValue)

const pluginOptions = {
  repositoryName: 'repositoryName',
  accessToken: 'accessToken',
  schemasDigest: 'schemasDigest',
  schemas: {},
  linkResolver,
  pathResolver,
  htmlSerializer,
}

test('validates options', () => {
  expect(() => validatePluginOptions(pluginOptions)).not.toThrow()
})

test('allows excluding checks', () => {
  expect(() =>
    validatePluginOptions({ ...pluginOptions, repositoryName: undefined }),
  ).toThrow('repositoryName')

  expect(() =>
    validatePluginOptions(
      { ...pluginOptions, repositoryName: undefined },
      { repositoryName: false },
    ),
  ).not.toThrow('repositoryName')
})

describe('repositoryName', () => {
  test('required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, repositoryName: undefined }),
    ).toThrow('repositoryName')
  })

  test('must be a string', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, repositoryName: Symbol() }),
    ).toThrow('repositoryName')
  })
})

describe('accessToken', () => {
  test('required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, accessToken: undefined }),
    ).toThrow('accessToken')
  })

  test('must be a string', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, accessToken: Symbol() }),
    ).toThrow('accessToken')
  })
})

describe('schemasDigest', () => {
  test('required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, schemasDigest: undefined }),
    ).toThrow('schemasDigest')
  })

  test('must be a string', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, schemasDigest: Symbol() }),
    ).toThrow('schemasDigest')
  })
})

describe('schemas', () => {
  test('required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, schemas: undefined }),
    ).toThrow('schemas')
  })

  test('must be an object', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, schemas: Symbol() }),
    ).toThrow('schemas')
  })
})

describe('linkResolver', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, linkResolver: undefined }),
    ).not.toThrow('linkResolver')
  })

  test('must be a function', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, linkResolver: Symbol() }),
    ).toThrow('linkResolver')
  })

  test('default to noop function', () => {
    const { linkResolver } = validatePluginOptions({
      ...pluginOptions,
      linkResolver: undefined,
    })

    expect(linkResolver()()).toBeUndefined()
  })
})

describe('pathResolver', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, pathResolver: undefined }),
    ).not.toThrow('pathResolver')
  })

  test('must be a function', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, pathResolver: Symbol() }),
    ).toThrow('pathResolver')
  })
})

describe('htmlSerializer', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, htmlSerializer: undefined }),
    ).not.toThrow('htmlSerializer')
  })

  test('must be a function', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, htmlSerializer: Symbol() }),
    ).toThrow('htmlSerializer')
  })

  test('default to noop function', () => {
    const { htmlSerializer } = validatePluginOptions({
      ...pluginOptions,
      htmlSerializer: undefined,
    })

    expect(htmlSerializer()()).toBeUndefined()
  })
})
