const path = require('path');

const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');
const defaultVal = require('default-val');

exports.prepare = function (extensions, filepath, cwd, nothrow) {
  var beforeEachFn, afterEachFn;
  switch (Object.prototype.toString.call(cwd)) {
    case '[object Object]': {
      beforeEachFn = defaultVal(cwd.beforeEach, noop);
      afterEachFn = defaultVal(cwd.afterEach, noop);
      nothrow = defaultVal(nothrow, cwd.nothrow, 'boolean');
      cwd = cwd.cwd;
      break;
    }
    default: {
      beforeEachFn = noop;
      afterEachFn = noop;
      break;
    }
  }

  var ext = extension(filepath);
  if (Object.keys(require.extensions).indexOf(ext) !== -1) {
    return true;
  }

  var config = normalize(extensions[ext]);
  if (!config) {
    if (nothrow) {
      return;
    } else {
      throw new Error('No module loader found for "' + ext + '".');
    }
  }

  if (!cwd) {
    cwd = path.dirname(path.resolve(filepath));
  }

  if (!Array.isArray(config)) {
    config = [config];
  }

  var onlyErrors = true;
  var attempts = [];
  var error;

  for (var i in config) {
    var option = config[i];

    beforeEachFn(option);

    var result = register(cwd, option.module, option.register);
    error = (result instanceof Error) ? result : null;
    if (error) {
      result = null;
    }
    var attempt = {
      moduleName: option.module,
      module: result,
      error: error
    };
    attempts.push(attempt);

    afterEachFn(error, attempt, option);

    if (!error) {
      onlyErrors = false;
      break;
    }
  }

  if (onlyErrors) {
    var err = new Error(
      'Unable to use specified module loaders for "' + ext + '".');
    err.failures = attempts;
    if (nothrow) {
      return err;
    } else {
      throw err;
    }
  }
  return attempts;
};

function noop() {}
