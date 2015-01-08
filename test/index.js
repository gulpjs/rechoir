const expect = require('chai').expect;
const rechoir = require('../')(module);

var expected = {
  data: {
    trueKey: true,
    falseKey: false,
    subKey: {
      subProp: 1
    }
  }
};

describe('registerFor', function () {
  it('should know coco', function () {
    rechoir.registerFor('./fixtures/test.co');
    expect(require('./fixtures/test.co')).to.deep.equal(expected);
  });
  it('should know coffee-script', function () {
    rechoir.registerFor('./fixtures/test.coffee');
    expect(require('./fixtures/test.coffee')).to.deep.equal(expected);
  });
  it('should know csv', function () {
    rechoir.registerFor('./fixtures/test.csv');
    expect(require('./fixtures/test.csv')).to.deep.equal([['r1c1','r1c2'],['r2c1','r2c2']]);
  });
  it('should know iced-coffee-script', function () {
    rechoir.registerFor('./fixtures/test.iced');
    expect(require('./fixtures/test.iced')).to.deep.equal(expected);
  });
  it('should know ini', function () {
    rechoir.registerFor('./fixtures/test.ini');
    expect(require('./fixtures/test.ini')).to.deep.equal({
      data: {
        trueKey: "true",
        falseKey: "false"
      }
    });
  });
  it('should know .js', function () {
    rechoir.registerFor('./fixtures/test.js');
    expect(require('./fixtures/test.js')).to.deep.equal(expected);
  });
  it('should know .json', function () {
    rechoir.registerFor('./fixtures/test.json');
    expect(require('./fixtures/test.json')).to.deep.equal(expected);
  });
  it('should know .json5', function () {
    rechoir.registerFor('./fixtures/test.json5');
    expect(require('./fixtures/test.json5')).to.deep.equal(expected);
  });
  it('should know jsx', function () {
    rechoir.registerFor('./fixtures/test.jsx');
    expect(require('./fixtures/test.jsx')).to.deep.equal(expected);
  });
  it('should know livescript', function () {
    rechoir.registerFor('./fixtures/test.ls');
    expect(require('./fixtures/test.ls')).to.deep.equal(expected);
  });
  it('should know literate coffee-script', function () {
    rechoir.registerFor('./fixtures/test.litcoffee');
    expect(require('./fixtures/test.litcoffee')).to.deep.equal(expected);
  });
  it('should know literate coffee-script (.md)', function () {
    rechoir.registerFor('./fixtures/test.coffee.md');
    expect(require('./fixtures/test.coffee.md')).to.deep.equal(expected);
  });
  it('should know literate iced-coffee-script', function () {
    rechoir.registerFor('./fixtures/test.liticed');
    expect(require('./fixtures/test.liticed')).to.deep.equal(expected);
  });
  it('should know literate iced-coffee-script (.md)', function () {
    rechoir.registerFor('./fixtures/test.iced.md');
    expect(require('./fixtures/test.iced.md')).to.deep.equal(expected);
  });
  it('should know toml', function () {
    rechoir.registerFor('./fixtures/test.toml');
    expect(require('./fixtures/test.toml')).to.deep.equal(expected);
  });
  it('should know xml', function () {
    rechoir.registerFor('./fixtures/test.xml');
    expect(JSON.parse(require('./fixtures/test.xml'))).to.deep.equal(expected);
  });
  it('should know yaml', function () {
    rechoir.registerFor('./fixtures/test.yaml');
    expect(require('./fixtures/test.yaml')).to.deep.equal(expected);
  });
  it('must not fail on folders with dots', function () {
    delete require.extensions['.yml'];
    delete require.extensions['.yaml'];
    delete require.cache[require.resolve('require-yaml')];
    rechoir.registerFor('./test/fixtures/folder.with.dots/test.yaml');
    expect(require('./fixtures/folder.with.dots/test.yaml')).to.deep.equal(expected);
  });
});

describe('load', function () {
  it('should automatically register a loader and require', function () {
    delete require.extensions['.coffee'];
    expect(rechoir.load('./fixtures/test.json')).to.deep.equal(expected);
  });
});

describe('interpret', function () {
  it('should expose the underlying interpret object', function () {
    expect(rechoir.interpret).to.deep.equal(require('interpret'));
  });
});

describe('rechoir', function () {
  it('should raise if module is undefined', function () {
    expect(function() {
      require('rechoir')();
    }).to.throw(Error);
  });
  it('should raise if module is null', function () {
    expect(function() {
      require('rechoir')(null);
    }).to.throw(Error);
  });
  it('should raise if module is missing require function', function () {
    expect(function() {
      require('rechoir')({});
    }).to.throw(Error);
  });
  it('should raise if module.require is not a function', function () {
    expect(function() {
      require('rechoir')({require : {}});
    }).to.throw(Error);
  });
  it('should raise if module.filepath is missing', function () {
    expect(function() {
      require('rechoir')({require : function(){}});
    }).to.throw(Error);
  });
  it('should raise if module.filepath is not a string', function () {
    expect(function() {
      require('rechoir')({require : function(){}, filepath: {}});
    }).to.throw(Error);
  });
});

