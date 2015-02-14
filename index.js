const path = require('path');
const resolve = require('resolve');
const interpret = require('interpret');

const EXTRE = /^[.]?[^.]+([.].*)$/;

function req (moduleName, cwd) {
  return require(resolve.sync(moduleName, {basedir: cwd}));
}

function handleLegacy (moduleName, legacyModuleName, cwd) {
  try {
    return req(moduleName, cwd);
  } catch (ignored) {
    try {
      return req(legacyModuleName, cwd);
    } catch (err) {
      // nice error messages
      var message = err.toString();
      message.replace(legacyModuleName, moduleName + '\' or \'' + legacyModuleName);
      throw new Error(message, err);
    }
  }
}

exports.registerFor = function (filepath, cwd) {
  var match = EXTRE.exec(path.basename(filepath));
  if (!match) {
    return;
  }
  var ext = match[1];
  if (Object.keys(require.extensions).indexOf(ext) !== -1) {
    return;
  }
  var moduleName = interpret.extensions[ext];
  if (!moduleName) {
    return;
  }
  if (!cwd) {
    cwd = path.dirname(path.resolve(filepath));
  }
  var legacyModuleName = interpret.legacy[ext];
  var config = interpret.configurations[moduleName];
  var compiler;
  if (legacyModuleName) {
    compiler = handleLegacy(moduleName, legacyModuleName, cwd);
  } else {
    compiler = req(moduleName, cwd);
  }
  var register = interpret.register[moduleName];
  if (register) {
    register(compiler, config);
  }
};

exports.interpret = interpret;
