module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  modulePathIgnorePatterns: ['dist/'],
  transformIgnorePatterns: ['node_modules/(?!(ky))'],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
}
