const rechoir = require('../..');

const expect = require('chai').expect;
const path = require('path');

describe('opts.cwd', function() {

  it('should specify cwd which has node_modules directory installing module loaders', function() {
    var exts = {
      '.xml': 'xml-loader.js'
    };
    var cwd = path.resolve(__dirname, '../fixtures/cwd');
    rechoir.prepare(exts, './test/fixtures/test.xml', cwd);
    var exp = {
      data: {
        falseKey: {
          _text: false,
        },
        subKey: {
          _attributes: {
            subProp: '1',
          }
        },
        trueKey: {
          _text: true,
        }
      }
    };
    expect(JSON.parse(require('../fixtures/test.xml'))).to.deep.equal(exp);
  });
});
