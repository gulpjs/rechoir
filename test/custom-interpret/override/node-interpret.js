
module.exports = {
  extensions : {
    '.bar' : 'coffee-script/register' 
  },
  register : {
    'coffee-script/register' : function (module) {
      var compiler = require.extensions['.coffee'];
      if (compiler && !require.extensions['.bar']) {
        require.extensions['.bar'] = compiler;
      }
    }
  },
  jsVariants : {
    '.bar' : 'coffee-script/register'
  }
}

