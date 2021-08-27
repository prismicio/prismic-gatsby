import * as TE from 'fp-ts/TaskEither'

export const fetchText = (
  ...args: Parameters<typeof fetch>
): TE.TaskEither<Error, string> =>
  TE.tryCatch(
    async () => await (await fetch(...args)).text(),
    (error) => error as Error,
  )
