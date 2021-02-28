'use strict';

var expect = require('expect');
var extension = require('../../lib/extension');

describe('Take out possible extensions from a file path', function() {

  it('should return an extension: ".js" from "app.js"', function(done) {
    expect(extension('app.js')).toEqual('.js');
    expect(extension('a/b/c/app.js')).toEqual('.js');
    done();
  });

  it('should return extensions: ".babel.js" and ".js" from "app.babel.js"', function(done) {
    expect(extension('app.babel.js')).toEqual(['.babel.js', '.js']);
    expect(extension('a/b/c/app.babel.js')).toEqual(['.babel.js', '.js']);
    done();
  });

  it('should return extensions: ".aaa.bbb.ccc", ".aaa.bbb" and ".ccc" from "app.aaa.bbb.ccc"', function(done) {
    expect(extension('app.aaa.bbb.ccc')).toEqual(['.aaa.bbb.ccc', '.bbb.ccc', '.ccc']);
    expect(extension('a/b/c/app.aaa.bbb.ccc')).toEqual(['.aaa.bbb.ccc', '.bbb.ccc', '.ccc']);
    done();
  });

  it('should return an extension: ".j" from "app.j"', function(done) {
    expect(extension('app.j')).toEqual('.j');
    expect(extension('a/b/c/app.j')).toEqual('.j');
    done();
  });

  it('should return extensions: ".b.j" and ".j" from "app.b.j"', function(done) {
    expect(extension('app.b.j')).toEqual(['.b.j', '.j']);
    expect(extension('a/b/c/app.b.j')).toEqual(['.b.j', '.j']);
    done();
  });

  it('should return extensions: ".a.b.c", ".a.b" and ".c" from "app.a.b.c"', function(done) {
    expect(extension('app.a.b.c')).toEqual(['.a.b.c', '.b.c', '.c']);
    expect(extension('a/b/c/app.a.b.c')).toEqual(['.a.b.c', '.b.c', '.c']);
    done();
  });

  it('should return undefined from "."', function(done) {
    expect(extension('.')).toBe(undefined);
    expect(extension('a/b/c/.')).toBe(undefined);
    done();
  });

  it('should return undefined from ".."', function(done) {
    expect(extension('..')).toBe(undefined);
    expect(extension('a/b/c/..')).toBe(undefined);
    done();
  });

  it('should return undefined from "..."', function(done) {
    expect(extension('...')).toBe(undefined);
    expect(extension('a/b/c/...')).toBe(undefined);
    done();
  });

  it('should return undefined from "a."', function(done) {
    expect(extension('a.')).toBe(undefined);
    expect(extension('a/b/c/a.')).toBe(undefined);
    done();
  });

  it('should return undefined from "app."', function(done) {
    expect(extension('app.')).toBe(undefined);
    expect(extension('a/b/c/app.')).toBe(undefined);
    done();
  });

  it('should return undefined from "a.b.c."', function(done) {
    expect(extension('a.b.c.')).toBe(undefined);
    expect(extension('a/b/c/a.b.c.')).toBe(undefined);
    done();
  });

  it('should return undefined from ".a"', function(done) {
    expect(extension('.a')).toBe(undefined);
    expect(extension('a/b/c/.a')).toBe(undefined);
    done();
  });

  it('should return undefined from ".app"', function(done) {
    expect(extension('.app')).toBe(undefined);
    expect(extension('a/b/c/.app')).toBe(undefined);
    done();
  });

  it('should return undefined from ".a."', function(done) {
    expect(extension('.a.')).toBe(undefined);
    expect(extension('a/b/c/.a.')).toBe(undefined);
    done();
  });

  it('should return undefined from ".app."', function(done) {
    expect(extension('.app.')).toBe(undefined);
    expect(extension('a/b/c/.app.')).toBe(undefined);
    done();
  });

  it('should return undefined from ".a.b.c."', function(done) {
    expect(extension('.a.b.c.')).toBe(undefined);
    expect(extension('a/b/c/.a.b.c.')).toBe(undefined);
    done();
  });

  it('should return ".b.c" and ".c" from ".a.b.c"', function(done) {
    expect(extension('.a.b.c')).toEqual(['.b.c', '.c']);
    expect(extension('a/b/c/.a.b.c')).toEqual(['.b.c', '.c']);
    done();
  });

  it('should return ".bb.cc" and ".cc" from ".aa.bb.cc"', function(done) {
    expect(extension('.aa.bb.cc')).toEqual(['.bb.cc', '.cc']);
    expect(extension('a/b/c/.aa.bb.cc')).toEqual(['.bb.cc', '.cc']);
    done();
  });

  it('should return "..b" and ".b" from ".a..b"', function(done) {
    expect(extension('.a..b')).toEqual(['..b', '.b']);
    expect(extension('a/b/c/.a..b')).toEqual(['..b', '.b']);
    done();
  });
});
