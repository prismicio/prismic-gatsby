export const notNullable = <T>(input: T): input is NonNullable<T> =>
  input != null
