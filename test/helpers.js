const Module = require('module');

const semver = require('semver');
const requireUncached = require('require-uncached');

// save the original Module._extensions
var original = Object.keys(Module._extensions).reduce(function(result, key){
  result[key] = require.extensions[key];
  return result;
}, {});
// save the original cache keys
var originalCacheKeys = Object.keys(require.cache);
// save the original Module.prototype.load because coffee-script overwrites it
var originalModuleLoad = Module.prototype.load;

function cleanup() {
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
}

function skippable(module, minVersion, fn) {
  if (semver.gte(requireUncached(module).VERSION, minVersion)) {
    cleanup();
    return fn;
  }
}

module.exports = {
  skippable: skippable,
  cleanup: cleanup
};
