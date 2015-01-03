const expect = require('chai').expect;
const rechoir = require('../../../');

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
  it('should know foo', function () {
    rechoir.registerFor('./test/custom-interpret/inherit/test.foo');
    expect(require('./test.foo')).to.deep.equal(expected);
  });
});

describe('interpret.extensions', function () {
  it('should have ownProperty .foo:\'coffee-script/register\'', function () {
    rechoir.registerFor('./test/custom-interpret/inherit/test.foo');
    expect(rechoir.interpret.extensions).to.have.ownProperty('.foo', 'coffee-script/register');
  });
});

afterEach(function (done) {
  delete require.extensions['.foo'];
  delete rechoir.interpret.extensions['.foo'];
  delete rechoir.interpret.register['coffee-script/register'];
  delete rechoir.interpret.jsVariants['.foo'];
  done();
});
