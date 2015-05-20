const chai = require('chai');
const expect = chai.expect;

const normalize = require('../../lib/normalize');

describe('normalize', function () {

  it('should convert a string input into array/object format', function () {
    expect(normalize('foo')).to.deep.equal({module:'foo'});
  });

  it('should convert object input into array format', function () {
    const input = {
      module: 'foo'
    };
    expect(normalize(input)).to.equal(input);
  });

  it('should iterate an array, normalizing each item', function () {
    const input = [
      { module: 'foo' },
      'bar'
    ];
    expect(normalize(input)).to.deep.equal([
      { module: 'foo' },
      { module: 'bar' }
    ]);
  });

});
