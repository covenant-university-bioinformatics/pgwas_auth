'use strict';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // setupFilesAfterEnv: ['./src/test/setup.ts'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
    '!**/__tests__/coverage/**',
    '!**/__tests__/utils/**',
    '!**/__tests__/images/**',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  rootDir: 'src',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};
