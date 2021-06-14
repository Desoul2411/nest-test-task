/* eslint-disable max-len */
module.exports = {
    clearMocks: true,  
    maxWorkers: 1,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
      '**/*.spec.ts',
      '**/__tests__/**/*.[jt]s?(x)',
      '!**/__tests__/coverage/**',
      '!**/__tests__/utils/**',
      '!**/__tests__/images/**',
    //   "**/?(*.)+(spec|test).[tj]s?(x)"
    ],
    moduleDirectories: ['node_modules', 'src'],
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
  };