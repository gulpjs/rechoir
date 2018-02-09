const rechoir = require('../..');

const expect = require('chai').expect;
const path = require('path');

var expected = {
  data: {
    trueKey: "true",
    falseKey: "false",
    subKey: {
      subProp: "1"
    }
  }
};

describe('opts.beforeEach, opts.afterEach', function() {
   var logs, idx;
   beforeEach(function() {
     logs = [];
     idx = 0;
   });

   var opts = {
     beforeEach: function(config) {
       logs.push('BEFORE-EACH:' + idx + ':' + config.module);
     },
     afterEach: function(err, attempt, config) {
       logs.push('AFTER-EACH:' + idx + ':' + (err ? 'failure' : 'success'));
       logs.push('AFTER-EACH:' + idx + ':' + attempt.moduleName +
         '(error:' + Boolean(attempt.error) + ')');
       logs.push('AFTER-EACH:' + idx + ':' + config.module);
       idx ++;
     },
     nothrow: true,
   };

   it('should execute hooks when a module loader is found', function() {
     rechoir.prepare({
       '.yaml': [
         'nothere',
         'require-yaml',
         'require-yml',
       ]
     }, './test/fixtures/test.yaml', opts);
     expect(logs).to.deep.equal([
       'BEFORE-EACH:0:nothere',
       'AFTER-EACH:0:failure',
       'AFTER-EACH:0:nothere(error:true)',
       'AFTER-EACH:0:nothere',
       'BEFORE-EACH:1:require-yaml',
       'AFTER-EACH:1:success',
       'AFTER-EACH:1:require-yaml(error:false)',
       'AFTER-EACH:1:require-yaml',
     ]);
   });

   it('should execute hooks when a module loader is not found', function() {
     rechoir.prepare({
       '.yaml': [
         'nothere',
         'orhere',
       ]
     }, './test/fixtures/test.yaml', opts);
     expect(logs).to.deep.equal([
       'BEFORE-EACH:0:nothere',
       'AFTER-EACH:0:failure',
       'AFTER-EACH:0:nothere(error:true)',
       'AFTER-EACH:0:nothere',
       'BEFORE-EACH:1:orhere',
       'AFTER-EACH:1:failure',
       'AFTER-EACH:1:orhere(error:true)',
       'AFTER-EACH:1:orhere',
     ]);
   });

});
