const expect = require('chai').expect;
const rechoir = require('../');

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
    rechoir.registerFor('./test/fixtures/test.co');
    expect(require('./fixtures/test.co')).to.deep.equal(expected);
  });

  it('should know coffee-script', function () {
    rechoir.registerFor('./test/fixtures/test.coffee');
    expect(require('./fixtures/test.coffee')).to.deep.equal(expected);
  });
  it('should know csv', function () {
    rechoir.registerFor('./test/fixtures/test.csv');
    expect(require('./fixtures/test.csv')).to.deep.equal([['r1c1','r1c2'],['r2c1','r2c2']]);
  });
  it('should know iced-coffee-script', function () {
    rechoir.registerFor('./test/fixtures/test.iced');
    expect(require('./fixtures/test.iced')).to.deep.equal(expected);
  });
  it('should know ini', function () {
    rechoir.registerFor('./test/fixtures/test.ini');
    expect(require('./fixtures/test.ini')).to.deep.equal({
      data: {
        trueKey: "true",
        falseKey: "false"
      }
    });
  });
  it('should know .js', function () {
    rechoir.registerFor('./test/fixtures/test.js');
    expect(require('./fixtures/test.js')).to.deep.equal(expected);
  });
  it('should know .json', function () {
    rechoir.registerFor('./test/fixtures/test.json');
    expect(require('./fixtures/test.json')).to.deep.equal(expected);
  });
  it('should know livescript', function () {
    rechoir.registerFor('./test/fixtures/test.ls');
    expect(require('./fixtures/test.ls')).to.deep.equal(expected);
  });
  it('should know literate coffee-script', function () {
    rechoir.registerFor('./test/fixtures/test.litcoffee');
    expect(require('./fixtures/test.litcoffee')).to.deep.equal(expected);
  });
  it('should know toml', function () {
    rechoir.registerFor('./test/fixtures/test.toml');
    expect(require('./fixtures/test.toml')).to.deep.equal(expected);
  });
  it('should know xml', function () {
    rechoir.registerFor('./test/fixtures/test.xml');
    expect(JSON.parse(require('./fixtures/test.xml'))).to.deep.equal(expected);
  });
  it('should know yaml', function () {
    rechoir.registerFor('./test/fixtures/test.yaml');
    expect(require('./fixtures/test.yaml')).to.deep.equal(expected);
  });
});

describe('load', function () {
  it('should automatically register a loader and require', function () {
    delete require.extensions['.coffee']
    expect(rechoir.load('./test/fixtures/test.json')).to.deep.equal(expected);
  });
});
