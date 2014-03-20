const expect = require('chai').expect;
const rechoir = require('../');
const extension = require('../lib/extension');

describe('extension', function () {
  it('should return the extension of a filename starting at the first dot', function () {
    expect(extension('test.coffee')).to.equal('.coffee');
    expect(extension('test.coffee.md')).to.equal('.coffee.md');
    expect(extension('test')).to.equal('');
  });
});

describe('interpret', function () {
  it('should read any js variant', function () {
    console.log(rechoir('./test/fixtures/file.coffee'));
  });
})
