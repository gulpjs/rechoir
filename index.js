const path = require('path');

const extension = require('./lib/extension');
const normalize = require('./lib/normalize');
const register = require('./lib/register');

exports.prepare = function (extensions, filepath, cwd, nothrow) {
  var option, attempt;
  var attempts = [];
  var err;
  var onlyErrors = false;
  var exts = extension(filepath);

  var supportsExtension = Object.keys(require.extensions).indexOf(exts[0]) !== -1;

  if (supportsExtension) {
    return true;
  }

  var config;
  var usedExtension;
  exts.some(function(ext) {
    usedExtension = ext;
    config = normalize(extensions[ext]);
    if (config) {
      return true;
    }
    return false;
  });

  if (!config) {
    throw new Error('No module loader found for "'+usedExtension+'".');
  }
  if (!cwd) {
    cwd = path.dirname(path.resolve(filepath));
  }
  if (!Array.isArray(config)) {
    config = [config];
  }
  for (var i in config) {
    option = config[i];
    attempt = register(cwd, option.module, option.register);
    error = (attempt instanceof Error) ? attempt : null;
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
    } else {
      onlyErrors = true;
    }
  }
  if (onlyErrors) {
    err = new Error('Unable to use specified module loaders for "'+usedExtension+'".');
    err.failures = attempts;
    if (nothrow) {
      return err;
    } else {
      throw err;
    }
  }
  return attempts;
};
