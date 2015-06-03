const path = require('path');

const EXTRE = /\.[^.]+/g;

module.exports = function (input) {
  var possibleExtensions = path.basename(input).match(EXTRE);
  if (!possibleExtensions) {
    return;
  }
  return possibleExtensions.map(function (item, idx, arr) {
    return arr.slice(idx).join('');
  });
};
