"use strict";

const path = require("path");
const globby = require("globby");
const { isProduction, projectRoot } = require("../env");
const coreOptions = require("../../src/main/core-options");
const codeSamples = require("../../website/playground/codeSamples").default;

const parserNames = coreOptions.options.parser.choices.map(
  ({ value }) => value
);
const distDirectory = path.join(projectRoot, "dist");

describe("standalone", () => {
  const standalone = require(path.join(distDirectory, "standalone.js"));
  const plugins = globby
    .sync(["parser-*.js"], { cwd: distDirectory, absolute: true })
    .map((file) => require(file));

  let esmStandalone;
  let esmPlugins;

  if (isProduction) {
    esmStandalone = require(path.join(distDirectory, "esm/standalone.mjs")).default;
    esmPlugins = globby
      .sync(["esm/parser-*.mjs"], { cwd: distDirectory, absolute: true })
      .map((file) => require(file).default);
  }

  for (const parser of parserNames) {
    test(parser, () => {
      const input = codeSamples(parser);
      const umdOutput = standalone.format(input, {
        parser,
        plugins,
      });

      expect(typeof input).toBe("string");
      expect(typeof umdOutput).toBe("string");
      expect(umdOutput).not.toBe(input);

      if (isProduction) {
        const esmOutput = esmStandalone.format(input, {
          parser,
          plugins: esmPlugins,
        });

        expect(esmOutput).toBe(umdOutput);
      }
    });
  }
});
