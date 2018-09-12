module.exports = {
  roots: ['<rootDir>/spec'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '.*\\.ts$',
  moduleFileExtensions: ['ts', 'js'],
  globals: {
    'ts-jest': {
      skipBabel: true,
    },
  },
}
