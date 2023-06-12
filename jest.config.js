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
    "{{domainEventsPackageName}}": ["<rootDir>/{{domainPath}}/src"],
    "{{clientLibraryPackageName}}": ["<rootDir>/{{clientLibraryPath}}/src"],
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },

};
