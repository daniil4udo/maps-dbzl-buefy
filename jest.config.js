const defaultPreset = require('@vue/cli-plugin-unit-jest/presets/typescript-and-babel/jest-preset');
const deepmerge = require('deepmerge');


process.env.MOCK_API_PORT = process.env.MOCK_API_PORT || Math.floor(Math.random() * (9999 - 9000 + 1) + 9000);

const jestConf = deepmerge(defaultPreset, {
  setupFiles: ['<rootDir>/tests/unit/setup'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/matchers'],

  // Global aliases aliases
  moduleNameMapper: {
    "^@$": "<rootDir>/src/index.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  }
,

  // Test matcher to be able place test next to the source file
  testMatch: ['**/(*.)spec.[jt]s?(x)'],

  // Coverage set up
  coverageDirectory: '<rootDir>/tests/unit/coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/jest.config.js'],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!**/node_modules/**',
    '!src/main.js',
    '!src/App.vue',
    '!src/router/index.js',
    '!src/router/routes.js',
    '!src/state/store.js',
    '!src/state/helpers.js',
    '!src/state/modules/index.js',
    '!src/components/_globals.js',
  ],

  // https://facebook.github.io/jest/docs/en/configuration.html#testurl-string
  // Set the `testURL` to a provided base URL if one exists, or the mock API base URL
  // Solves: https://stackoverflow.com/questions/42677387/jest-returns-network-error-when-doing-an-authenticated-request-with-axios
  testURL: process.env.API_BASE_URL || `http://localhost:${process.env.MOCK_API_PORT}`,

  // https://github.com/jest-community/jest-watch-typeahead
  // Added by Vue CLI
  // watchPlugins: []

  globals: {
    'vue-jest': {
      // Compilation errors in the <style> tags of Vue components will
      // already result in failing builds, so compiling CSS during unit
      // tests doesn't protect us from anything. It only complicates
      // and slows down our unit tests.
      experimentalCSSCompile: false,
    },
  },
});

module.exports = jestConf;
