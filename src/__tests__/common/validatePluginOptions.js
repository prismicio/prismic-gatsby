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

describe('fetchLinks', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, fetchLinks: undefined }),
    ).not.toThrow('fetchLinks')
  })

  test('must be an array', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, fetchLinks: Symbol() }),
    ).toThrow('fetchLinks')
  })

  test('default to an empty array', () => {
    const { fetchLinks } = validatePluginOptions({
      ...pluginOptions,
      fetchLinks: undefined,
    })

    expect(fetchLinks).toEqual([])
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

describe('lang', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, lang: undefined }),
    ).not.toThrow('lang')
  })

  test('default to *', () => {
    const { lang } = validatePluginOptions({
      ...pluginOptions,
      lang: undefined,
    })

    expect(lang).toBe('*')
  })
})

describe('shouldDownloadImage', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({
        ...pluginOptions,
        shouldDownloadImage: undefined,
      }),
    ).not.toThrow('shouldDownloadImage')
  })

  test('must be a function', () => {
    expect(() =>
      validatePluginOptions({
        ...pluginOptions,
        shouldDownloadImage: Symbol(),
      }),
    ).toThrow('shouldDownloadImage')
  })

  test('default to function returning false', () => {
    const { shouldDownloadImage } = validatePluginOptions({
      ...pluginOptions,
      shouldDownloadImage: undefined,
    })

    expect(shouldDownloadImage()).toBe(false)
  })
})

describe('plugins', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, plugins: undefined }),
    ).not.toThrow('plugins')
  })

  test('must be empty array', () => {
    expect(() =>
      validatePluginOptions({ ...pluginOptions, plugins: [] }),
    ).not.toThrow('plugins')

    expect(() =>
      validatePluginOptions({ ...pluginOptions, plugins: [Symbol()] }),
    ).toThrow('plugins')
  })

  test('default to empty array', () => {
    const { plugins } = validatePluginOptions({
      ...pluginOptions,
      plugins: undefined,
    })

    expect(plugins).toEqual([])
  })
})

describe('typePathsFilenamePrefix', () => {
  test('not required', () => {
    expect(() =>
      validatePluginOptions({
        ...pluginOptions,
        typePathsFilenamePrefix: undefined,
      }),
    ).not.toThrow('typePathsFilenamePrefix')
  })

  test('default to expected default', () => {
    const { typePathsFilenamePrefix } = validatePluginOptions({
      ...pluginOptions,
      typePathsFilenamePrefix: undefined,
    })

    expect(typePathsFilenamePrefix).toBe(
      `prismic-typepaths---${pluginOptions.repositoryName}-`,
    )
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
