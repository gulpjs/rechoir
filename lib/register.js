const resolve = require('resolve');

module.exports = function (cwd, moduleName, register) {
  try {
    var modulePath = resolve.sync(moduleName, {basedir: cwd});
    var result = require(modulePath);
    if (typeof register === 'function') {
      register(result);
    }
    return result;
  } catch (e) {
    return e;
  }
};
