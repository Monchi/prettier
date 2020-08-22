"use strict";

const installPrettier = require("./scripts/install-prettier");

const isProduction = process.env.NODE_ENV === "production";
const ENABLE_CODE_COVERAGE = !!process.env.ENABLE_CODE_COVERAGE;
if (isProduction || process.env.INSTALL_PACKAGE) {
  process.env.PRETTIER_DIR = installPrettier();
}
const { TEST_STANDALONE } = process.env;

const testPathIgnorePatterns = [];
if (TEST_STANDALONE) {
  testPathIgnorePatterns.push("<rootDir>/tests_integration/");
}
if (!isProduction) {
  // Only test ESM bundle for production
  testPathIgnorePatterns.push(
    "<rootDir>/tests_integration/__tests__/esm-bundle.mjs"
  );
}

module.exports = {
  setupFiles: ["<rootDir>/tests_config/run_spec.js"],
  snapshotSerializers: [
    "jest-snapshot-serializer-raw",
    "jest-snapshot-serializer-ansi",
  ],
  testRegex: "jsfmt\\.spec\\.js$|__tests__/.*\\.m?js$",
  testPathIgnorePatterns,
  collectCoverage: ENABLE_CODE_COVERAGE,
  collectCoverageFrom: ["<rootDir>/src/**/*.js", "<rootDir>/bin/**/*.js"],
  coveragePathIgnorePatterns: ["<rootDir>/src/document/doc-debug.js"],
  coverageReporters: ["text", "lcov"],
  moduleNameMapper: {
    "prettier/local": "<rootDir>/tests_config/require_prettier.js",
    "prettier/standalone": "<rootDir>/tests_config/require_standalone.js",
  },
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  moduleFileExtensions: ["js", "json", "mjs"],
  testEnvironment: "node",
  transform: {
    "^.+\\.mjs$": [
      "babel-jest",
      {
        presets: ["@babel/env"],
      },
    ],
  },
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
};
