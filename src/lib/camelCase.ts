import * as cc from 'camel-case'

export const camelCase = (...parts: (string | null | undefined)[]): string =>
  cc.camelCase(parts.filter((p) => p != null).join(' '), {
    transform: cc.camelCaseTransformMerge,
  })
