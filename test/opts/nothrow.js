const rechoir = require('../..');

const expect = require('chai').expect;
const path = require('path');

var exts = {
  '.coffee': [
    'nothere',
    'orhere'
  ]
};

var testFilePath = path.join(__dirname, '../fixtures', 'test.coffee');

describe('opts.nothrow', function() {

  it('should throw error listing each module loader that was attempted when nothrow = false', function () {
    var opts = { nothrow: false };
    var err;
    try {
      rechoir.prepare(exts, testFilePath, opts);
    } catch (e) {
      err = e;
      check_failures(e);
    }
    expect(err).to.be.instanceof(Error);
  });

  it('should return error listing each module loader that was attempted when nothrow = true', function () {
    var opts = { nothrow: true };
    check_failures(
      rechoir.prepare(exts, testFilePath, opts)
    );
  });

  function check_failures (e) {
    expect(e.failures).to.be.an('array');
    expect(e.failures[0].error).to.be.instanceof(Error);
    expect(e.failures[0].moduleName).to.equal('nothere');
    expect(e.failures[0].module).to.be.null;
    expect(e.failures[1].error).to.be.instanceof(Error);
    expect(e.failures[1].moduleName).to.equal('orhere');
    expect(e.failures[1].module).to.be.null;
  }
});
