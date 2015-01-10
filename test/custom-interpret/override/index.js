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
  it('should know bar', function () {
    rechoir.registerFor('./test/custom-interpret/override/test.bar');
    expect(require('./test.bar')).to.deep.equal(expected);
  });
});

describe('interpret', function () {
  it('should have ownProperty .bar:\'coffee-script/register\'', function () {
    rechoir.registerFor('./test/custom-interpret/override/test.bar');
    expect(rechoir.interpret.extensions).to.have.ownProperty('.bar', 'coffee-script/register');
  });
  it('should not have ownProperty .foo', function () {
    rechoir.registerFor('./test/custom-interpret/override/test.bar');
    expect(rechoir.interpret.extensions).to.not.have.ownProperty('.foo');
  });
});

afterEach(function (done) {
  delete require.extensions['.bar'];
  delete rechoir.interpret.extensions['.bar'];
  delete rechoir.interpret.register['coffee-script/register'];
  delete rechoir.interpret.jsVariants['.bar'];
  delete rechoir.interpret.legacy['.bar'];
  done();
});
