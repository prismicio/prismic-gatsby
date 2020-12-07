import * as gatsby from 'gatsby'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const isGatsbyNodeInput = (value: any): value is gatsby.NodeInput => {
  if ('id' in value && 'internal' in value) {
    return value.hasOwnProperty('contentDigest') && value.hasOwnProperty('type')
  }

  return false
}
