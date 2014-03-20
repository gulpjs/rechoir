const fs = require('fs');

const csVariant = function (moduleName) {
  return {
    module: moduleName,
    build: function (compiler) {
      return function (filename) {
        var content = fs.readFileSync(filename, 'utf8');
        var result = compiler.compile(content, {
          filename: filename,
          bare: true
        });
        return module._compile(result, filename);
      };
    }
  };
};

module.exports = {
  '': null,
  '.js': null,
  '.json': null,
  '.coffee': csVariant('coffee-script'),
  '.litcoffee': csVariant('coffee-script'),
  '.coffee.md': csVariant('coffee-script'),
  '.iced': csVariant('iced-coffee-script'),
  '.co': csVariant('coco'),
  '.coco': csVariant('coco'),
  '.ls': csVariant('livescript')
};
