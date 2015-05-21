const chai = require('chai');
const expect = chai.expect;

const register = require('../../lib/register');

describe('register', function () {

  it('should return the specified module relative to the provided cwd', function () {
    expect(register(__dirname, 'chai')).to.equal(chai);
  });

  it('should call a register function if provided, passing in the module', function () {
    register(__dirname, 'chai', function (attempt) {
      expect(attempt).to.equal(chai);
    });
  });

  it('should return an error if the specified module cannot be registered', function () {
    expect(register(__dirname, 'whatev')).to.be.an.instanceof(Error);
  });

});
