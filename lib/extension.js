const path = require('path');

const EXTRE = /\.[^.]+/g;
const LONGEXTRE = /^[.]?[^.]+([.].+[^.])$/;

module.exports = function (input) {
  var basename = path.basename(input);
  var longExtension = LONGEXTRE.exec(basename);
  if (!longExtension) {
    return;
  }
  var possibleExtensions = longExtension[1].match(EXTRE);
  if (!possibleExtensions) {
    return;
  }
  return possibleExtensions.map(function (_, idx, exts) {
    return exts.slice(idx).join('');
  });
};
