const path = require('path');
const Module = require('module');

const chai = require('chai');
const expect = chai.expect;

const rechoir = require('../');
const extension = require('../lib/extension');
const normalize = require('../lib/normalize');
const register = require('../lib/register');

// save the original Module._extensions
const originalExtensions = Object.keys(Module._extensions);
const original = originalExtensions.reduce(function (result, key) {
  result[key] = require.extensions[key];
  return result;
}, {});
// save the original cache keys
const originalCacheKeys = Object.keys(require.cache);

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

describe('rechoir', function () {

  describe('extension', function () {

    it('should extract extension from filename/path from the first dot', function () {
      expect(extension('file.js')[0]).to.equal('.js');
      expect(extension('file.tmp.dot.js')[0]).to.equal('.tmp.dot.js');
      expect(extension('file.tmp.dot.js')[1]).to.equal('.dot.js');
      expect(extension('file.tmp.dot.js')[2]).to.equal('.js');
      expect(extension('relative/path/to/file.js')[0]).to.equal('.js');
      expect(extension('relative/path/to/file.dot.js')[0]).to.equal('.dot.js');
      expect(extension('relative/path/to/file.dot.js')[1]).to.equal('.js');
      expect(extension('relative/path.with.dot/to/file.dot.js')[0]).to.equal('.dot.js');
      expect(extension('relative/path.with.dot/to/file.dot.js')[1]).to.equal('.js');
    });

    it('does not match any if the path ends in a dot', function () {
      expect(extension('file.js.')).to.equal(undefined);
    });

    it('treats additional dots as a separate extension', function () {
      // Double
      expect(extension('file.babel..js')).to.deep.equal(['.babel..js', '..js', '.js']);
      expect(extension('file..babel.js')).to.deep.equal(['..babel.js', '.babel.js', '.js']);
      // Triple
      expect(extension('file.babel...js')).to.deep.equal(['.babel...js', '...js', '..js', '.js']);
      expect(extension('file...babel.js')).to.deep.equal(['...babel.js', '..babel.js', '.babel.js', '.js']);
    });

    it('does not consider a leading dot to be an extension', function () {
      expect(extension('.config')).to.equal(undefined);
    });
  });

  describe('normalize', function () {

    it('should convert a string input into array/object format', function () {
      expect(normalize('foo')).to.deep.equal({module:'foo'});
    });

    it('should convert object input into array format', function () {
      const input = {
        module: 'foo'
      };
      expect(normalize(input)).to.equal(input);
    });

    it('should iterate an array, normalizing each item', function () {
      const input = [
        { module: 'foo' },
        'bar'
      ];
      expect(normalize(input)).to.deep.equal([
        { module: 'foo' },
        { module: 'bar' }
      ]);
    });
  });

  describe('register', function () {

    it('should return the specified module relative to the provided cwd', function () {
      expect(register(__dirname, 'chai')).to.equal(chai);
    });

    it('should call a register function if provided, passing in the module', function () {
      register(__dirname, 'chai', function (attempt) {
        expect(attempt).to.equal(chai);
      });
    });

    it('should return an error if the specified module cannot be registered', function () {
      expect(register(__dirname, 'whatev')).to.be.an.instanceof(Error);
    });
  });

  describe('prepare', function () {
    var testFilePath = path.join(__dirname, 'fixtures', 'test.stub');

    beforeEach(cleanup);

    it('should throw if extension is unknown', function () {
      expect(function () {
        rechoir.prepare({}, './test/fixtures/test.whatever');
      }).to.throw(/No module loader found for/);
    });

    it('should return undefined if an unknown extension is specified when nothrow is enabled', function () {
      expect(rechoir.prepare({}, './test/fixtures/.testrc', null, true)).to.be.undefined;
    });

    it('should throw if a module loader cannot be found or loaded', function () {
      expect(function () {
        rechoir.prepare({
          '.stub': ['nothere']
        }, testFilePath);
        require(testFilePath);
      }).to.throw();
    });

    describe('all module loaders that were attempted failed to load', function () {
      var exts = {
        '.stub': [
          'nothere',
          'orhere'
        ]
      };

      // Check the failure entries in the thrown or returned error object.
      function check_failures (e) {
        expect(e.failures).to.be.an('array');
        expect(e.failures[0].error).to.be.instanceof(Error);
        expect(e.failures[0].moduleName).to.equal('nothere');
        expect(e.failures[0].module).to.be.null;
        expect(e.failures[1].error).to.be.instanceof(Error);
        expect(e.failures[1].moduleName).to.equal('orhere');
        expect(e.failures[1].module).to.be.null;
      }

      it('should throw error listing each module loader that was attempted when nothrow = false', function () {
        var err;
        try {
          rechoir.prepare(exts, testFilePath);
        } catch (e) {
          err = e;
          check_failures(e);
        }
        expect(err).to.be.instanceof(Error);
      });

      it('should return error listing each module loader that was attempted when nothrow = true', function () {
        check_failures(
          rechoir.prepare(exts, testFilePath, null, true)
        );
      });
    });

    it('should register a module loader for the specified extension', function () {
      const result = rechoir.prepare({
        '.stub': [
          'nothere',
          '../require-stub'
        ]
      }, testFilePath);
      expect(function () {
        require(testFilePath);
      }).to.not.throw(Error);
    });

    it('should return true if the module loader for the specified extension is already available', function () {
      rechoir.prepare({
        '.stub': [
          'nothere',
          '../require-stub'
        ]
      }, testFilePath);
      expect(rechoir.prepare({
        '.stub': [
          'nothere',
          '../require-stub'
        ]
      }, testFilePath)).to.be.true;
    });

    it('must not fail on folders with dots', function () {
      rechoir.prepare({ '.stub': '../../require-stub' }, './test/fixtures/folder.with.dots/test.stub');
      expect(require('./fixtures/folder.with.dots/test.stub')).to.deep.equal({
        data: {
          trueKey: true,
          falseKey: false,
          subKey: {
            subProp: 1
          },
        }
      });
    });
  });

});
