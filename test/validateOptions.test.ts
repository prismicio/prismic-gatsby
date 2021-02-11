import {validatePluginOptions} from '../src/validateOptions'
import {PluginOptions} from '../src/types'

describe('validatePlugOptions', () => {
  describe('mandatory options', () => {

    const defaults = {
      linkResolver: expect.any(Function),
      htmlSerializer: expect.any(Function),
      accessToken: undefined,
      customTypeToken: undefined,
      fetchLinks: [],
      lang: '*',
      typePathsFilenamePrefix: 'prismic-typepaths---',
      prismicToolbar: false,
      releaseID: undefined,
      imageImgixParams: { auto: 'format,compress', fit: 'max', q: 50 },
      imagePlaceholderImgixParams: { w: 100, blur: 15, q: 20 },
      plugins: [],
      shouldDownloadImage: expect.any(Function),
      webhookSecret: undefined,
     }

    it('can have repository name and schemas', () => {
      const opts = {
        repositoryName: 'example',
        schemas: {},
      } as PluginOptions

      const result = validatePluginOptions(opts)

      expect(result).toEqual({...defaults, ...opts})
    })

    it('can have repository name and customTypeToken', () => {
      const opts = {
        repositoryName: 'example-custom-types',
        customTypeToken: 'qwerty',
      } as PluginOptions

      const result = validatePluginOptions(opts)

      expect(result).toEqual({...defaults, ...opts})
    })

    it('should throw an error when nether customTypeToken or schemas are provided', () => {

      const opts = {
        repositoryName: 'exmpale-missing-types',
      } as PluginOptions

      expect(() => validatePluginOptions(opts)).toThrow()
    })

    it('should throw an error if repositoyName is not provided', () => {

      const opts = {
        schemas: {},
      } as PluginOptions

      expect(() => validatePluginOptions(opts)).toThrow()
    })
  })
})