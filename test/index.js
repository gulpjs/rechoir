const path = require('path');
const Module = require('module');

const expect = require('chai').expect;

const semver = require('semver');
const requireUncached = require('require-uncached');

const extensions = require('interpret').extensions;

const rechoir = require('../');

var expected = {
  data: {
    trueKey: true,
    falseKey: false,
    subKey: {
      subProp: 1
    }
  }
};

process.env.TYPESCRIPT_REGISTER_USE_CACHE = 'false';

function skippable(module, minVersion, fn){
  if (semver.gte(requireUncached(module).VERSION, minVersion)) {
    return fn;
  }
}

describe('rechoir', function () {
  var original;
  var originalCacheKeys;
  var originalModuleLoad;

  before(function () {
    // save the original cache keys
    originalCacheKeys = Object.keys(require.cache);
    // save the original Module._extensions
    original = Object.keys(Module._extensions).reduce(function(result, key){
      result[key] = require.extensions[key];
      return result;
    }, {});
    // save the original Module.prototype.load because coffee-script overwrites it
    originalModuleLoad = Module.prototype.load;
  });

  require('./lib/extension');
  require('./lib/normalize');
  require('./lib/register');

  describe('prepare', function () {
    var testFilePath = path.join(__dirname, 'fixtures', 'test.coffee');

    beforeEach(function () {
      // restore the require.cache to startup state
      Object.keys(require.cache).forEach(function(key){
        if(originalCacheKeys.indexOf(key) === -1){
          delete require.cache[key];
        }
      });
      // restore the original Module.prototype.load
      Module.prototype.load = originalModuleLoad;
      // restore the original Module._extensions
      var extensions = Object.keys(original);
      Object.keys(Module._extensions).forEach(function(ext){
        if(extensions.indexOf(ext) === -1){
          delete Module._extensions[ext];
        } else {
          Module._extensions[ext] = original[ext];
        }
      });
    });

    it('should throw if extension is unknown', function () {
      expect(function () {
        rechoir.prepare(extensions, './test/fixtures/test.whatever');
      }).to.throw(/No module loader found for/);
    });

    it('should throw if a module loader cannot be found or loaded', function () {
      expect(function () {
        require(testFilePath);
      }).to.throw;
    });

    it('should include errors for each module loader that was attempted if they failed to load', function () {
      try {
        rechoir.prepare({
          '.coffee': [
            'nothere',
            'orhere'
          ]
        }, testFilePath);
      } catch (e) {
        expect(e.failures).to.be.array;
        expect(e.failures[0].error).to.be.instanceof(Error);
        expect(e.failures[0].module).to.equal('nothere');
        expect(e.failures[1].error).to.be.instanceof(Error);
        expect(e.failures[1].module).to.equal('orhere');
      }
    });

    it('should register a module loader for the specified extension', function () {
      const result = rechoir.prepare({
        '.coffee': [
          'nothere',
          'coffee-script/register',
          'coffee-script'
        ]
      }, testFilePath);
      expect(function () {
        require(testFilePath);
      }).to.not.throw(Error);
    });

    it('should return true if the module loader for the specified extension is already available', function () {
      rechoir.prepare({
        '.coffee': [
          'nothere',
          'coffee-script/register',
          'coffee-script'
        ]
      }, testFilePath);
      expect(rechoir.prepare({
        '.coffee': [
          'nothere',
          'coffee-script/register',
          'coffee-script'
        ]
      }, testFilePath)).to.be.true;
    });

    it('should know babel.js', function () {
      rechoir.prepare(extensions, './test/fixtures/test.babel.js');
      expect(require('./fixtures/test.babel.js')).to.deep.equal(expected);
    });
    it('should know coco', function () {
      rechoir.prepare(extensions, './test/fixtures/test.co');
      expect(require('./fixtures/test.co')).to.deep.equal(expected);
    });
    it('should know coffee-script', function () {
      rechoir.prepare(extensions, './test/fixtures/test.coffee');
      expect(require('./fixtures/test.coffee')).to.deep.equal(expected);
    });
    it('should know csv', function () {
      rechoir.prepare(extensions, './test/fixtures/test.csv');
      expect(require('./fixtures/test.csv')).to.deep.equal([['r1c1','r1c2'],['r2c1','r2c2']]);
    });
    it('should know iced-coffee-script', function () {
      rechoir.prepare(extensions, './test/fixtures/test.iced');
      expect(require('./fixtures/test.iced')).to.deep.equal(expected);
    });
    it('should know ini', function () {
      rechoir.prepare(extensions, './test/fixtures/test.ini');
      expect(require('./fixtures/test.ini')).to.deep.equal({
        data: {
          trueKey: "true",
          falseKey: "false"
        }
      });
    });
    it('should know .js', function () {
      rechoir.prepare(extensions, './test/fixtures/test.js');
      expect(require('./fixtures/test.js')).to.deep.equal(expected);
    });
    it('should know .json', function () {
      rechoir.prepare(extensions, './test/fixtures/test.json');
      expect(require('./fixtures/test.json')).to.deep.equal(expected);
    });
    it('should know .json5', function () {
      rechoir.prepare(extensions, './test/fixtures/test.json5');
      expect(require('./fixtures/test.json5')).to.deep.equal(expected);
    });
    it('should know jsx', function () {
      rechoir.prepare(extensions, './test/fixtures/test.jsx');
      expect(require('./fixtures/test.jsx')).to.deep.equal(expected);
    });
    it('should know livescript', function () {
      rechoir.prepare(extensions, './test/fixtures/test.ls');
      expect(require('./fixtures/test.ls')).to.deep.equal(expected);
    });
    it('should know literate coffee-script', skippable('coffee-script', '1.5.0', function () {
      rechoir.prepare(extensions, './test/fixtures/test.litcoffee');
      expect(require('./fixtures/test.litcoffee')).to.deep.equal(expected);
    }));
    it('should know literate coffee-script (.md)', skippable('coffee-script', '1.6.3', function () {
      rechoir.prepare(extensions, './test/fixtures/test.coffee.md');
      expect(require('./fixtures/test.coffee.md')).to.deep.equal(expected);
    }));
    it('should know literate iced-coffee-script', skippable('iced-coffee-script', '1.7.1', function () {
      rechoir.prepare(extensions, './test/fixtures/test.liticed');
      expect(require('./fixtures/test.liticed')).to.deep.equal(expected);
    }));
    it('should know literate iced-coffee-script (.md)', skippable('iced-coffee-script', '1.7.1', function () {
      rechoir.prepare(extensions, './test/fixtures/test.iced.md');
      expect(require('./fixtures/test.iced.md')).to.deep.equal(expected);
    }));
    it('should know ts', function () {
      this.timeout(5000);
      rechoir.prepare(extensions, './test/fixtures/test.ts');
      expect(require('./fixtures/test.ts')).to.deep.equal(expected);
    });
    it('should know toml', function () {
      rechoir.prepare(extensions, './test/fixtures/test.toml');
      expect(require('./fixtures/test.toml')).to.deep.equal(expected);
    });
    it('should know xml', function () {
      rechoir.prepare(extensions, './test/fixtures/test.xml');
      expect(JSON.parse(require('./fixtures/test.xml'))).to.deep.equal(expected);
    });
    it('should know yaml', function () {
      rechoir.prepare(extensions, './test/fixtures/test.yaml');
      expect(require('./fixtures/test.yaml')).to.deep.equal(expected);
    });
    it('must not fail on folders with dots', function () {
      delete require.cache[require.resolve('require-yaml')];
      rechoir.prepare(extensions, './test/fixtures/folder.with.dots/test.yaml');
      expect(require('./fixtures/folder.with.dots/test.yaml')).to.deep.equal(expected);
    });
  });

});
