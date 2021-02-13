module.exports = {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['dist/'],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
}
