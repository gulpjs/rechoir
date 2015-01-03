const path = require('path');
const resolve = require('resolve');
const interpret = require('interpret');

const EXTRE = /^[.]?[^.]+([.].*)$/;

module.exports = function (mod) {

    var path = mod.require('path');

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
          cwd = path.resolve(path.dirname(mod.filename));
        }
        var moduleName = interpret.extensions[ext];
        if (moduleName) {
          var compiler = mod.require(resolve.sync(moduleName, {basedir: cwd}));
          var register = interpret.register[moduleName];
          if (register) {
            register(compiler);
          }
        }
      },

      load : function (filepath) {
        result.registerFor(filepath);
        return mod.require(filepath);
      },

      interpret : interpret
    }

    return result;
}

