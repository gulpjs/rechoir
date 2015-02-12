const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const interpret = require('interpret');
const findup = require('findup-sync');

const EXTRE = /^[.]?[^.]+([.].*)$/;
const interpretKeys = Object.keys(interpret);

function req (moduleName, cwd) {
  return require(resolve.sync(moduleName, {basedir: cwd}));
}

function handleLegacy (moduleName, legacyModuleName, cwd) {
  try {
    return req(moduleName, cwd);
  } catch (err) {
    try {
      return req(legacyModuleName, cwd);
    } catch (__) {
      // nice error messages
      err.message = err.message.replace(moduleName, moduleName + '\' or \'' + legacyModuleName);
      throw err;
    }
  }
}

function extend(target, source) {
    for (var key in source) {
        if (interpretKeys.indexOf(key) !== -1) {
            target[key] = extend(target[key] || {}, source[key]);
        }
        else {
            target[key] = source[key];
        }
    }
    return target;
}

function mergeCustomInterpret(target, cwd) {
    var result = extend(target, interpret);
    try {
        var filepath = findup('node-interpret.js', {cwd : cwd, nocase : true});
        if (filepath) {
            var customInterpret = require(filepath);
            result = extend(result, customInterpret);
        }
    }
    catch (e) {
        // ignore
    }
    return result;
}

// first try to merge from process.cwd()
var mergedInterpret = mergeCustomInterpret({}, process.cwd());

exports.registerFor = function (filepath, cwd) {
  var match = EXTRE.exec(path.basename(filepath));
  if (!match) {
    return;
  }
  var ext = match[1];
  if (Object.keys(require.extensions).indexOf(ext) !== -1) {
    return;
  }
  if (!cwd) {
    cwd = path.dirname(path.resolve(filepath));
  }
  // now we try to merge from the cwd and give the user
  // a chance to override on a per test case basis
  mergeCustomInterpret(mergedInterpret, cwd);
  var moduleName = mergedInterpret.extensions[ext];
  if (!moduleName) {
    return;
  }
  var legacyModuleName = mergedInterpret.legacy[ext];
  var config = mergedInterpret.configurations[moduleName];
  var compiler;
  if (legacyModuleName) {
    compiler = handleLegacy(moduleName, legacyModuleName, cwd);
  } else {
    compiler = req(moduleName, cwd);
  }
  var register = mergedInterpret.register[moduleName];
  if (register) {
    register(compiler, config);
  }
};

module.exports.interpret = mergedInterpret;

