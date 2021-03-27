declare module 'global-jsdom' {
  import { ConstructorOptions } from 'jsdom'

  export default function globalJsdom(
    html?: string,
    config?: ConstructorOptions,
  ): void
}
