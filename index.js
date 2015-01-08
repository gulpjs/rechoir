const path = require('path');
const resolve = require('resolve');
const interpret = require('interpret');

const EXTRE = /^[.]?[^.]+([.].*)$/;

module.exports = function (aModule) {

    if (typeof aModule === 'undefined' || aModule === null) {
      throw new Error('aModule parameter missing or null.');
    }

    if (typeof aModule.require !== 'function') {
      throw new Error('aModule.require missing or not a function');
    }

    if (typeof aModule.filename !== 'string') {
      throw new Error('aModule.filename missing or not a string');
    }

    var result = {
      registerFor : function (filepath, cwd) {
        var match = EXTRE.exec(path.basename(filepath));
        if (!match) {
          return;
        }
        var ext = match[1];
        if (Object.keys(require.extensions).indexOf(ext) !== -1) {
          return;
        }
        if (!cwd) {
          cwd = path.resolve(path.dirname(aModule.filename));
        }
        var moduleName = interpret.extensions[ext];
        if (moduleName) {
          var compiler = aModule.require(resolve.sync(moduleName, {basedir: cwd}));
          var register = interpret.register[moduleName];
          if (register) {
            register(compiler);
          }
        }
      },

      load : function (filepath) {
        result.registerFor(filepath);
        return aModule.require(filepath);
      },

      interpret : interpret
    }

    return result;
}

