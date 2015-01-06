const path = require('path');
const resolve = require('resolve');
const interpret = require('interpret');
const findup = require('findup-sync');

const EXTRE = /^[.]?[^.]+([.].*)$/;

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
  var moduleName = interpret.extensions[ext];
  if (moduleName) {
    var modulePath = resolve.sync(moduleName, {basedir: cwd});
    var packagePath = path.dirname(findup('package.json', {cwd : path.dirname(modulePath)}));
    var compiler = require(modulePath);
    var register = interpret.register[moduleName];
    if (register) {
      register(compiler, { packagePath : packagePath });
    }
  }
}

exports.load = function (filepath) {
  exports.registerFor(filepath);
  return require(path.resolve(filepath));
};

exports.interpret = interpret;
