const resolve = require('resolve');

module.exports = function (module, cwd) {
  return require(resolve.sync(module, {basedir: cwd}));
};
