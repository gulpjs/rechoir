const path = require('path');

const EXTRE = /(\.[^.]+)+$/;

module.exports = function (input) {
  var possibleExtensions = EXTRE.exec(path.basename(input));
  if (!possibleExtensions) {
    return;
  }
  return possibleExtensions;
};
