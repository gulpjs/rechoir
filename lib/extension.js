module.exports = function (path) {
  var pos = path.indexOf('.');
  if (pos === -1) {
    return '';
  }
  return path.slice(pos);
};
