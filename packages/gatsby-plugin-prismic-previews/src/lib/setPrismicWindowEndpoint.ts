import * as IO from 'fp-ts/IO'

declare global {
  interface Window {
    prismic?: {
      endpoint?: string
    }
  }
}

export const setPrismicWindowEndpoint =
  (endpoint: string): IO.IO<void> =>
  () => {
    window.prismic = { ...window.prismic, endpoint }
  }
