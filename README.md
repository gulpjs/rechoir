# rechoir [![Build Status](https://secure.travis-ci.org/tkellen/node-rechoir.png)](http://travis-ci.org/tkellen/node-rechoir)
> Require any supported file as a node module.

[![NPM](https://nodei.co/npm/rechoir.png)](https://nodei.co/npm/rechoir/)


## What is it?
This module can find, require and register any file type the npm ecosystem has a module loader for.

**Currently supported extensions:**

`.co, .coco, .coffee, .iced, .ini, .js, .json, .litcoffee, .ls, .toml, .xml, .yaml, .yml`

**Note:** If you'd like to add a new extension, please make a PR for [interpret](https://github.com/tkellen/node-interpret).

## API

### registerFor(filepath, requireFrom)
Look for a module loader associated with the provided file and attempt require it.  If necessary, run any setup required to inject it into [require.extensions](http://nodejs.org/api/globals.html#globals_require_extensions). If calling this method is successful (aka: it doesn't throw), you can now require files of the type you requested natively.

`filepath` A file whose type you'd like to register a module loader for.

`requireFrom` An optional path to start searching for the module required to load the requested file.  Defaults to the directory of `filepath`.

**Note:** While rechoir will automatically load and register transpilers like `coffee-script`, you must provide a local installation.  The transpilers are **not** bundled with this module..

#### Usage
```js
var rechoir = require('rechoir');
rechoir.registerFor('path/to/file.coffee');
// coffee-script is now loaded and registered with node
require('file.coffee');
```

### load (filepath)
Automatically call `requireFor`, then require the requested file and return the result.

#### Usage
```js
var rechoir = require('rechoir');
rechoir.load('file.coffee');
```

