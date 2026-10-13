module.exports = function (cwd, moduleName, register) {
  var result;
  try {
    var modulePath = require.resolve(moduleName, { paths: [cwd] });
    result = require(modulePath);
    if (typeof register === "function") {
      register(result);
    }
  } catch (e) {
    result = e;
  }
  return result;
};
