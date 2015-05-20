const Module = require('module');

const semver = require('semver');
const requireUncached = require('require-uncached');

// save the original Module._extensions
const originalExtensions = Object.keys(Module._extensions);
const original = originalExtensions.reduce(function (result, key) {
  result[key] = require.extensions[key];
  return result;
}, {});
// save the original cache keys
const originalCacheKeys = Object.keys(require.cache);
// save the original Module.prototype.load because coffee-script overwrites it
const originalModuleLoad = Module.prototype.load;

function cleanupCache(key) {
  if(originalCacheKeys.indexOf(key) === -1){
    delete require.cache[key];
  }
}

function cleanupExtensions(ext) {
  if(originalExtensions.indexOf(ext) === -1){
    delete Module._extensions[ext];
  } else {
    Module._extensions[ext] = original[ext];
  }
}

function cleanup() {
  // restore the require.cache to startup state
  Object.keys(require.cache).forEach(cleanupCache);
  // restore the original Module.prototype.load
  Module.prototype.load = originalModuleLoad;
  // restore the original Module._extensions
  Object.keys(Module._extensions).forEach(cleanupExtensions);
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
