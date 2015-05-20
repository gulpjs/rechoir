const expect = require('chai').expect;

const extension = require('../../lib/extension');

describe('extension', function () {

  it('should extract extension from filename/path from the first dot', function () {
    expect(extension('file.js')).to.equal('.js');
    expect(extension('file.dot.js')).to.equal('.dot.js');
    expect(extension('relative/path/to/file.js')).to.equal('.js');
    expect(extension('relative/path/to/file.dot.js')).to.equal('.dot.js');
  });
  
});
