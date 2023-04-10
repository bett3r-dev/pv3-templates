/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose:true,
  testMatch: ['**/*test.ts', '**/*spec.ts'],
  moduleDirectories: [
    'node_modules',
    '<rootDir>'
  ],
  moduleNameMapper: {
    "@domainEvents": "<rootDir>/domainEvents/index.js",
    "@libraries": "<rootDir>/libraries/index.js",
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },

};
