const path = require('path');
const extension = require('./lib/extension');
const loaders = require('./lib/loaders');
const requireLocal = require('./lib/require_local');

module.exports = function (filepath, cwd) {
  var ext = extension(filepath);
  var cwd = path.resolve(cwd||path.dirname(filepath));
  var loader = loaders[ext];
  var compiler = require;
  if (loader && loader.module) {
    var module = requireLocal(loader.module, cwd);
    console.log('got module',module);
    compiler = loader.build(module);
  }
  return compiler(filepath);
};
