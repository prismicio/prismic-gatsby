import * as pc from 'pascal-case'

export const pascalCase = (...parts: (string | null | undefined)[]): string =>
  pc.pascalCase(parts.filter((p) => p != null).join(' '), {
    transform: pc.pascalCaseTransformMerge,
  })
