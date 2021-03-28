var path = require('path');
var Module = require('module');

var expect = require('expect');

var rechoir = require('../');
var extension = require('../lib/extension');
var normalize = require('../lib/normalize');
var register = require('../lib/register');

// save the original Module._extensions
var originalExtensions = Object.keys(Module._extensions);
var original = originalExtensions.reduce(function(result, key) {
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

function cleanup(done) {
  // restore the require.cache to startup state
  Object.keys(require.cache).forEach(cleanupCache);
  // restore the original Module._extensions
  Object.keys(Module._extensions).forEach(cleanupExtensions);

  done();
}

describe('rechoir', function() {

  describe('extension', function() {

    it('should extract extension from filename/path from the first dot', function(done) {
      expect(extension('file.js')[0]).toEqual('.js');
      expect(extension('file.tmp.dot.js')[0]).toEqual('.tmp.dot.js');
      expect(extension('file.tmp.dot.js')[1]).toEqual('.dot.js');
      expect(extension('file.tmp.dot.js')[2]).toEqual('.js');
      expect(extension('relative/path/to/file.js')[0]).toEqual('.js');
      expect(extension('relative/path/to/file.dot.js')[0]).toEqual('.dot.js');
      expect(extension('relative/path/to/file.dot.js')[1]).toEqual('.js');
      expect(extension('relative/path.with.dot/to/file.dot.js')[0]).toEqual('.dot.js');
      expect(extension('relative/path.with.dot/to/file.dot.js')[1]).toEqual('.js');

      done();
    });

    it('does not match any if the path ends in a dot', function(done) {
      expect(extension('file.js.')).toEqual(undefined);

      done();
    });

    it('treats additional dots as a separate extension', function(done) {
      // Double
      expect(extension('file.babel..js')).toEqual(['.babel..js', '..js', '.js']);
      expect(extension('file..babel.js')).toEqual(['..babel.js', '.babel.js', '.js']);
      // Triple
      expect(extension('file.babel...js')).toEqual(['.babel...js', '...js', '..js', '.js']);
      expect(extension('file...babel.js')).toEqual(['...babel.js', '..babel.js', '.babel.js', '.js']);

      done();
    });

    it('does not consider a leading dot to be an extension', function(done) {
      expect(extension('.config')).toEqual(undefined);

      done();
    });
  });

  describe('normalize', function() {

    it('should convert a string input into array/object format', function(done) {
      expect(normalize('foo')).toEqual({ module: 'foo' });

      done();
    });

    it('should convert object input into array format', function(done) {
      var input = {
        module: 'foo',
      };
      expect(normalize(input)).toEqual(input);

      done();
    });

    it('should iterate an array, normalizing each item', function(done) {
      var input = [
        { module: 'foo' },
        'bar',
      ];
      expect(normalize(input)).toEqual([
        { module: 'foo' },
        { module: 'bar' },
      ]);

      done();
    });
  });

  describe('register', function() {

    it('should return the specified module relative to the provided cwd', function(done) {
      expect(register(__dirname, 'expect')).toEqual(expect);

      done();
    });

    it('should call a register function if provided, passing in the module', function(done) {
      register(__dirname, 'expect', function(attempt) {
        expect(attempt).toEqual(expect);
      });

      done();
    });

    it('should return an error if the specified module cannot be registered', function(done) {
      expect(register(__dirname, 'whatev')).toBeAn(Error);

      done();
    });
  });

  describe('prepare', function() {
    var testFilePath = path.join(__dirname, 'fixtures', 'test.stub');

    beforeEach(cleanup);

    it('should throw if extension is unknown', function(done) {
      expect(function() {
        rechoir.prepare({}, './test/fixtures/test.whatever');
      }).toThrow(/No module loader found for/);

      done();
    });

    it('should return undefined if an unknown extension is specified when nothrow is enabled', function(done) {
      expect(rechoir.prepare({}, './test/fixtures/.testrc', null, true)).toEqual(undefined);

      done();
    });

    it('should throw if a module loader cannot be found or loaded', function(done) {
      expect(function() {
        rechoir.prepare({
          '.stub': ['nothere'],
        }, testFilePath);
        require(testFilePath);
      }).toThrow();

      done();
    });

    describe('all module loaders that were attempted failed to load', function() {
      var exts = {
        '.stub': [
          'nothere',
          'orhere',
        ],
      };

      // Check the failure entries in the thrown or returned error object.
      function checkFailures(e) {
        expect(e.failures).toBeAn('array');
        expect(e.failures[0].error).toBeAn(Error);
        expect(e.failures[0].moduleName).toEqual('nothere');
        expect(e.failures[0].module).toEqual(null);
        expect(e.failures[1].error).toBeAn(Error);
        expect(e.failures[1].moduleName).toEqual('orhere');
        expect(e.failures[1].module).toEqual(null);
      }

      it('should throw error listing each module loader that was attempted when nothrow = false', function(done) {
        var err;
        try {
          rechoir.prepare(exts, testFilePath);
        } catch (e) {
          err = e;
          checkFailures(e);
        }
        expect(err).toBeAn(Error);

        done();
      });

      it('should return error listing each module loader that was attempted when nothrow = true', function(done) {
        checkFailures(
          rechoir.prepare(exts, testFilePath, null, true)
        );

        done();
      });
    });

    it('should register a module loader for the specified extension', function(done) {
      rechoir.prepare({
        '.stub': [
          'nothere',
          '../require-stub',
        ],
      }, testFilePath);
      expect(function() {
        require(testFilePath);
      }).toNotThrow(Error);

      done();
    });

    it('should return true if the module loader for the specified extension is already available', function(done) {
      rechoir.prepare({
        '.stub': [
          'nothere',
          '../require-stub',
        ],
      }, testFilePath);
      expect(rechoir.prepare({
        '.stub': [
          'nothere',
          '../require-stub',
        ],
      }, testFilePath)).toEqual(true);

      done();
    });

    it('must not fail on folders with dots', function(done) {
      rechoir.prepare({ '.stub': '../../require-stub' }, './test/fixtures/folder.with.dots/test.stub');
      expect(require('./fixtures/folder.with.dots/test.stub')).toEqual({
        data: {
          trueKey: true,
          falseKey: false,
          subKey: {
            subProp: 1,
          },
        },
      });

      done();
    });

    it('should register a module loader even if the extension is single character (issue #38)', function(done) {
      var fpath = path.join(__dirname, 'fixtures', 'test.s');
      rechoir.prepare({
        '.s': [
          'nothere',
          '../require-stub',
        ],
      }, fpath);

      expect(function() {
        require(fpath);
      }).toNotThrow(Error);

      done();
    });
  });

});
