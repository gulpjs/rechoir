var path = require("node:path");
var Module = require("node:module");
var assert = require("node:assert");
var { beforeEach, describe, it } = require("node:test");

var rechoir = require("../");
var extension = require("../lib/extension");
var normalize = require("../lib/normalize");
var register = require("../lib/register");

// save the original Module._extensions
var originalExtensions = Object.keys(Module._extensions);
var original = originalExtensions.reduce(function (result, key) {
  result[key] = require.extensions[key];
  return result;
}, {});
// save the original cache keys
var originalCacheKeys = Object.keys(require.cache);

function cleanupCache(key) {
  if (originalCacheKeys.indexOf(key) === -1) {
    delete require.cache[key];
  }
}

function cleanupExtensions(ext) {
  if (originalExtensions.indexOf(ext) === -1) {
    delete Module._extensions[ext];
  } else {
    Module._extensions[ext] = original[ext];
  }
}

function cleanup() {
  // restore the require.cache to startup state
  Object.keys(require.cache).forEach(cleanupCache);
  // restore the original Module._extensions
  Object.keys(Module._extensions).forEach(cleanupExtensions);
}

describe("rechoir", function () {
  describe("extension", function () {
    it("should extract extension from filename/path from the first dot", function () {
      assert.deepStrictEqual(extension("file.js")[0], ".js");
      assert.deepStrictEqual(extension("file.tmp.dot.js")[0], ".tmp.dot.js");
      assert.deepStrictEqual(extension("file.tmp.dot.js")[1], ".dot.js");
      assert.deepStrictEqual(extension("file.tmp.dot.js")[2], ".js");
      assert.deepStrictEqual(extension("relative/path/to/file.js")[0], ".js");
      assert.deepStrictEqual(
        extension("relative/path/to/file.dot.js")[0],
        ".dot.js",
      );
      assert.deepStrictEqual(
        extension("relative/path/to/file.dot.js")[1],
        ".js",
      );
      assert.deepStrictEqual(
        extension("relative/path.with.dot/to/file.dot.js")[0],
        ".dot.js",
      );
      assert.deepStrictEqual(
        extension("relative/path.with.dot/to/file.dot.js")[1],
        ".js",
      );
    });

    it("does not match any if the path ends in a dot", function () {
      assert.deepStrictEqual(extension("file.js."), undefined);
    });

    it("treats additional dots as a separate extension", function () {
      // Double
      assert.deepStrictEqual(extension("file.babel..js"), [
        ".babel..js",
        "..js",
        ".js",
      ]);
      assert.deepStrictEqual(extension("file..babel.js"), [
        "..babel.js",
        ".babel.js",
        ".js",
      ]);
      // Triple
      assert.deepStrictEqual(extension("file.babel...js"), [
        ".babel...js",
        "...js",
        "..js",
        ".js",
      ]);
      assert.deepStrictEqual(extension("file...babel.js"), [
        "...babel.js",
        "..babel.js",
        ".babel.js",
        ".js",
      ]);
    });

    it("does not consider a leading dot to be an extension", function () {
      assert.strictEqual(extension(".config"), undefined);
    });
  });

  describe("normalize", function () {
    it("should convert a string input into array/object format", function () {
      assert.deepStrictEqual(normalize("foo"), { module: "foo" });
    });

    it("should convert object input into array format", function () {
      var input = {
        module: "foo",
      };
      assert.deepStrictEqual(normalize(input), input);
    });

    it("should iterate an array, normalizing each item", function () {
      var input = [{ module: "foo" }, "bar"];
      assert.deepStrictEqual(normalize(input), [
        { module: "foo" },
        { module: "bar" },
      ]);
    });
  });

  describe("register", function () {
    //using normalize to test
    it("should return the specified module relative to the provided cwd", function () {
      assert.strictEqual(register(__dirname, "../lib/normalize"), normalize);
    });

    it("should call a register function if provided, passing in the module", function (t) {
      var callback = t.mock.fn();

      register(__dirname, "../lib/normalize", callback);

      assert.strictEqual(callback.mock.callCount(), 1);
      assert.strictEqual(callback.mock.calls[0].arguments[0], normalize);
    });

    it("should return an error if the specified module cannot be registered", function () {
      assert.ok(register(__dirname, "whatev") instanceof Error);
    });
  });

  describe("prepare", function () {
    var testFilePath = path.join(__dirname, "fixtures", "test.stub");

    beforeEach(cleanup);

    it("should throw if extension is unknown", function () {
      assert.throws(
        () => rechoir.prepare({}, "./test/fixtures/test.whatever"),
        {
          message: 'No module loader found for ".whatever".',
        },
      );
    });

    it("should return undefined if an unknown extension is specified when nothrow is enabled", function () {
      assert.strictEqual(
        rechoir.prepare({}, "./test/fixtures/.testrc", null, true),
        undefined,
      );
    });

    it("should throw if a module loader cannot be found or loaded", function () {
      assert.throws(() => {
        rechoir.prepare(
          {
            ".stub": ["nothere"],
          },
          testFilePath,
        );
        require(testFilePath);
      });
    });

    describe("all module loaders that were attempted failed to load", function () {
      var exts = {
        ".stub": ["nothere", "orhere"],
      };

      // Check the failure entries in the thrown or returned error object.
      function checkFailures(e) {
        assert.ok(Array.isArray(e.failures));
        assert.ok(e.failures[0].error instanceof Error);
        assert.strictEqual(e.failures[0].moduleName, "nothere");
        assert.strictEqual(e.failures[0].module, null);
        assert.ok(e.failures[1].error instanceof Error);
        assert.strictEqual(e.failures[1].moduleName, "orhere");
        assert.strictEqual(e.failures[1].module, null);
      }

      it("should throw error listing each module loader that was attempted when nothrow = false", function () {
        var err;
        try {
          rechoir.prepare(exts, testFilePath);
        } catch (e) {
          err = e;
          checkFailures(e);
        }
        assert.ok(err instanceof Error);
      });

      it("should return error listing each module loader that was attempted when nothrow = true", function () {
        checkFailures(rechoir.prepare(exts, testFilePath, null, true));
      });
    });

    it("should register a module loader for the specified extension", function () {
      rechoir.prepare(
        {
          ".stub": ["nothere", "../require-stub"],
        },
        testFilePath,
      );
      assert.doesNotThrow(() => require(testFilePath));

    });

    it("should return true if the module loader for the specified extension is already available", function () {
      rechoir.prepare(
        {
          ".stub": ["nothere", "../require-stub"],
        },
        testFilePath,
      );
      assert.strictEqual(
        rechoir.prepare(
          {
            ".stub": ["nothere", "../require-stub"],
          },
          testFilePath,
        ),
        true,
      );
    });

    it("must not fail on folders with dots", function () {
      rechoir.prepare(
        { ".stub": "../../require-stub" },
        "./test/fixtures/folder.with.dots/test.stub",
      );

      var expected = {
        data: {
          trueKey: true,
          falseKey: false,
          subKey: {
            subProp: 1,
          },
        },
      };

      assert.deepStrictEqual(
        require("./fixtures/folder.with.dots/test.stub"),
        expected,
      );
    });

    it("should register a module loader even if the extension is single character (issue #38)", function () {
      var fpath = path.join(__dirname, "fixtures", "test.s");
      rechoir.prepare(
        {
          ".s": ["nothere", "../require-stub"],
        },
        fpath,
      );

      assert.doesNotThrow(() => require(fpath));
    });

    it("should register a module loader for the specified extension with cwd", function () {
      rechoir.prepare(
        {
          ".foo": ["nothere", "../require-stub"],
        },
        path.join("cwd", "test.foo"),
        path.join(__dirname, "fixtures"),
      );

      assert.doesNotThrow(() => require(testFilePath));
    });
  });
});
