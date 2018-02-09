# rechoir [![Build Status](https://secure.travis-ci.org/js-cli/js-rechoir.png)](http://travis-ci.org/js-cli/js-rechoir)
> Require any supported file as a node module.

[![NPM](https://nodei.co/npm/rechoir.png)](https://nodei.co/npm/rechoir/)

## What is it?
This module, in conjunction with [interpret]-like objects can register any file type the npm ecosystem has a module loader for. This library is a dependency of [Liftoff].

## Usage
```js
const config = require('interpret').extensions;
const rechoir = require('rechoir');
rechoir.prepare(config, './test/fixtures/test.coffee');
rechoir.prepare(config, './test/fixtures/test.csv');
rechoir.prepare(config, './test/fixtures/test.toml');

console.log(require('./test/fixtures/test.coffee'));
console.log(require('./test/fixtures/test.csv'));
console.log(require('./test/fixtures/test.toml'));
```

## API

### .prepare(config, filepath, cwd, nothrow)<br/>.prepare(config, filepath, opts)

Look for a module loader associated with the provided file and attempt require it.  If necessary, run any setup required to inject it into [require.extensions](http://nodejs.org/api/globals.html#globals_require_extensions).

If this method is successful (aka: founds and registers a module loader), you can now require files of the type you requested natively.

If this method failed (aka: founds no module loader configured for a given extension), this method throws (or returns, if *nothrow* is true) an error with a `.failure` property.

If a loader is already registered, this will simply return `true`.

**Note:** While rechoir will automatically load and register transpilers like `coffee-script`, you must provide a local installation. The transpilers are **not** bundled with this module.

#### Parameters:

| Parameter     |  Type  | Description                                 |
|:--------------|:------:|:--------------------------------------------|
| *config*      | object | An [interpret]-like configuration object.   |
| *filepath*    | string | A file whose type you'd like to register a module loader for. |
| *cwd*         | string | An optional path to start searching for the module required to load the requested file.  Defaults to the directory of *filepath*. |
| *nothrow*     | boolean| An optional flag to specify whether this method throws an error when no module loader is found. |
| *opts*        | object | An optional object which can specify `.cwd`, `.nothrow` and 2 **hooks**. (`.beforeEach` and `.afterEach`). |

* ***opts*** : object
    
    Is a plain object and its properties are as follows:
    
    | Property      |   Type   | Description                         |
    |:--------------|:--------:|:------------------------------------|
    | `.cwd`        | string   | An optional path to start searching for the module required to load the requested file.  Defaults to the directory of *filepath*. |
    | `.nothrow`    | boolean  | An optional flag to specify whether this method throws an error when no module loader is found. |
    | `.beforeEach` | function | A hook called before every registering of module loader.  |
    | `.afterEach`  | function | A hook called after every registering of module loader.   |
    
    * **.beforeEach** : function

        Is a function of which return type is void, and its parameters are as follows:
    
        | Parameter    |   Type   | Description                        |
        |:-------------|:--------:|:-----------------------------------|
        | *config*     |  object  | A configuration object which is attempting to register. |
    
    * **.afterEach** : function

        Is a function of which return type is void, and its parameters are as follows:

        | Parameter    |   Type   | Description                        |
        |:-------------|:--------:|:-----------------------------------|
        | *error*      |  Error   | An error object, if failed to register. |
        | *attempt*    |  object  | An **attempt result** object.      |
        | *config*     |  object  | A configuration object which attempted to register. |

    
#### Returns:

* An array which contains '**attempt result**' objects, if a module loader is found and registered.

    An **attempt result** object is a plain object of which properties are:
    
    | Property      |  Type   | Description                                      |
    |:--------------|:-------:|:-------------------------------------------------|
    | `.moduleName` | string  | A module name attempted to register.             |
    | `.module`     | *any*   | A module body, if succeed in registering, otherwise `null`. |
    | `.error`      | Error   | An error, if failed to register, otherwise `null`. |

* `true`, if a module loader configured for a given extension is already registered.

* An error object which has `.failure` property, if *nothrow* is true and no module loader is found.

    The value of `.failure` property is an array of **attempt result** objects.

* `undefined`, if *nothrow* is true and no configure is specified for a given extension.

#### Throws:

* An error object which has `.failure` property, if *nothrow* is false and no module loader is found.

    The value of `.failure` property is an array of **attempt result** objects.

* An error object, if *nothrow* is false and no configure is specified for a given extension.



[interpret]: http://github.com/tkellen/js-interpret
[Liftoff]: http://github.com/tkellen/js-liftoff
