"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var extension = require("../lib/extension");

describe("Take out possible extensions from a file path", function () {
  it('should return an extension: ".js" from "app.js"', function () {
    assert.deepStrictEqual(extension("app.js"), [".js"]);
    assert.deepStrictEqual(extension("a/b/c/app.js"), [".js"]);
  });

  it('should return extensions: ".babel.js" and ".js" from "app.babel.js"', function () {
    assert.deepStrictEqual(extension("app.babel.js"), [".babel.js", ".js"]);
    assert.deepStrictEqual(extension("a/b/c/app.babel.js"), [
      ".babel.js",
      ".js",
    ]);
  });

  it('should return extensions: ".aaa.bbb.ccc", ".aaa.bbb" and ".ccc" from "app.aaa.bbb.ccc"', function () {
    assert.deepStrictEqual(extension("app.aaa.bbb.ccc"), [
      ".aaa.bbb.ccc",
      ".bbb.ccc",
      ".ccc",
    ]);
    assert.deepStrictEqual(extension("a/b/c/app.aaa.bbb.ccc"), [
      ".aaa.bbb.ccc",
      ".bbb.ccc",
      ".ccc",
    ]);
  });

  it('should return an extension: ".j" from "app.j"', function () {
    assert.deepStrictEqual(extension("app.j"), [".j"]);
    assert.deepStrictEqual(extension("a/b/c/app.j"), [".j"]);
  });

  it('should return extensions: ".b.j" and ".j" from "app.b.j"', function () {
    assert.deepStrictEqual(extension("app.b.j"), [".b.j", ".j"]);
    assert.deepStrictEqual(extension("a/b/c/app.b.j"), [".b.j", ".j"]);
  });

  it('should return extensions: ".a.b.c", ".a.b" and ".c" from "app.a.b.c"', function () {
    assert.deepStrictEqual(extension("app.a.b.c"), [".a.b.c", ".b.c", ".c"]);
    assert.deepStrictEqual(extension("a/b/c/app.a.b.c"), [
      ".a.b.c",
      ".b.c",
      ".c",
    ]);
  });

  it('should return undefined from "."', function () {
    assert.strictEqual(extension("."), undefined);
    assert.strictEqual(extension("a/b/c/."), undefined);
  });

  it('should return undefined from ".."', function () {
    assert.strictEqual(extension(".."), undefined);
    assert.strictEqual(extension("a/b/c/.."), undefined);
  });

  it('should return undefined from "..."', function () {
    assert.strictEqual(extension("..."), undefined);
    assert.strictEqual(extension("a/b/c/..."), undefined);
  });

  it('should return undefined from "a."', function () {
    assert.strictEqual(extension("a."), undefined);
    assert.strictEqual(extension("a/b/c/a."), undefined);
  });

  it('should return undefined from "app."', function () {
    assert.strictEqual(extension("app."), undefined);
    assert.strictEqual(extension("a/b/c/app."), undefined);
  });

  it('should return undefined from "a.b.c."', function () {
    assert.strictEqual(extension("a.b.c."), undefined);
    assert.strictEqual(extension("a/b/c/a.b.c."), undefined);
  });

  it('should return undefined from ".a"', function () {
    assert.strictEqual(extension(".a"), undefined);
    assert.strictEqual(extension("a/b/c/.a"), undefined);
  });

  it('should return undefined from ".app"', function () {
    assert.strictEqual(extension(".app"), undefined);
    assert.strictEqual(extension("a/b/c/.app"), undefined);
  });

  it('should return undefined from ".a."', function () {
    assert.strictEqual(extension(".a."), undefined);
    assert.strictEqual(extension("a/b/c/.a."), undefined);
  });

  it('should return undefined from ".app."', function () {
    assert.strictEqual(extension(".app."), undefined);
    assert.strictEqual(extension("a/b/c/.app."), undefined);
  });

  it('should return undefined from ".a.b.c."', function () {
    assert.strictEqual(extension(".a.b.c."), undefined);
    assert.strictEqual(extension("a/b/c/.a.b.c."), undefined);
  });

  it('should return ".b.c" and ".c" from ".a.b.c"', function () {
    assert.deepStrictEqual(extension(".a.b.c"), [".b.c", ".c"]);
    assert.deepStrictEqual(extension("a/b/c/.a.b.c"), [".b.c", ".c"]);
  });

  it('should return ".bb.cc" and ".cc" from ".aa.bb.cc"', function () {
    assert.deepStrictEqual(extension(".aa.bb.cc"), [".bb.cc", ".cc"]);
    assert.deepStrictEqual(extension("a/b/c/.aa.bb.cc"), [".bb.cc", ".cc"]);
  });

  it('should return "..b" and ".b" from ".a..b"', function () {
    assert.deepStrictEqual(extension(".a..b"), ["..b", ".b"]);
    assert.deepStrictEqual(extension("a/b/c/.a..b"), ["..b", ".b"]);
  });
});
