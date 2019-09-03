export const isFunction = x => !!(x && x.constructor && x.call && x.apply)

// See: lodash.pick
export const pick = fields => obj =>
  Object.keys(obj).reduce((acc, key) => {
    if (fields.includes(key)) acc[key] = obj[key]
    return acc
  }, {})

// See: lodash.omit
export const omit = fields => obj =>
  Object.keys(obj).reduce((acc, key) => {
    if (!fields.includes(key)) acc[key] = obj[key]
    return acc
  }, {})

// Maps an object to a new object with key-value pairs. Mapping function must
// return a key-value tuple.
export const mapObj = fn => async obj => {
  const entries = Object.entries(obj)
  const pairs = await Promise.all(entries.map(x => Promise.resolve(fn(x))))

  const result = {}

  for (let i = 0; i < pairs.length; i++) {
    const [k, v] = pairs[i]
    result[k] = v
  }

  return result
}
