
module.exports = {
  extensions : {
    '.foo' : 'coffee-script/register' 
  },
  register : {
    'coffee-script/register' : function (module) {
      var compiler = require.extensions['.coffee'];
      if (compiler && !require.extensions['.foo']) {
        require.extensions['.foo'] = compiler;
      }
    }
  },
  jsVariants : {
    '.foo' : 'coffee-script/register'
  }
}

