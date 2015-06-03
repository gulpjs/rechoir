const expect = require('chai').expect;

const extension = require('../../lib/extension');

describe('extension', function () {

  it('should extract extension from filename/path from the first dot', function () {
    expect(extension('file.js')[0]).to.equal('.js');
    expect(extension('file.tmp.dot.js')[0]).to.equal('.tmp.dot.js');
    expect(extension('file.tmp.dot.js')[1]).to.equal('.dot.js');
    expect(extension('file.tmp.dot.js')[2]).to.equal('.js');
    expect(extension('relative/path/to/file.js')[0]).to.equal('.js');
    expect(extension('relative/path/to/file.dot.js')[0]).to.equal('.dot.js');
    expect(extension('relative/path/to/file.dot.js')[1]).to.equal('.js');
    expect(extension('relative/path.with.dot/to/file.dot.js')[0]).to.equal('.dot.js');
    expect(extension('relative/path.with.dot/to/file.dot.js')[1]).to.equal('.js');
  });
});
