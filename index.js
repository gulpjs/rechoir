const path = require('path');

const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');

exports.prepare = function (extensions, filepath, cwd, nothrow) {
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

  for (var i in config) {
    var option = config[i];
    var attempt = register(cwd, option.module, option.register);
    var error = (attempt instanceof Error) ? attempt : null;
    if (error) {
      attempt = null;
    }
    attempts.push({
      moduleName: option.module,
      module: attempt,
      error: error
    });
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
