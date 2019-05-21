# shell-source
Source environment variables from a shell script into a [Node.js](http://nodejs.org/) process.

[![npm](http://img.shields.io/npm/v/shell-source.svg?style=flat-square)](http://www.npmjs.org/shell-source)
[![tests](https://img.shields.io/travis/jessetane/shell-source.svg?style=flat-square&branch=master)](https://travis-ci.org/jessetane/shell-source)
[![coverage](https://img.shields.io/coveralls/jessetane/shell-source.svg?style=flat-square&branch=master)](https://coveralls.io/r/jessetane/shell-source)

#### Dragons:
> Since sourcing a shell script allows it to execute arbitrary code, you should be 100% sure its contents are not malicious!

## Why
You have some configuration data stored in a sourcable shell script, but need access to that data from a JavaScript program. You could try to parse the file as text, but that would only work if the script does not execute code or expand any variables.

## How
Spawns the process owner's default shell and executes a [POSIX](http://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html#dot) compliant wrapper script that in turn [sources](http://www.tldp.org/HOWTO/Bash-Prompt-HOWTO/x237.html) the file of your choosing. The wrapper then calls [`printenv`](http://www.tldp.org/LDP/Bash-Beginners-Guide/html/sect_03_02.html) which writes the child process' updated environment to stdout. The parent (Node.js) process then parses this output and updates `process.env`.

## Example
Consider the script below that needs to execute code before its variables can be evaluated:
```bash
export SERVER_HOST="$(hostname)"
export SERVER_PORT="$(grep -m1 '# HTTP Alternate' < /etc/services | sed 's/[^0-9]*\(.*\)\/.*/\1/')"
export PATH="node_modules/.bin:$PATH"
```

A Node.js process can use `shell-source` to emulate the behavior of `sh`'s `.` built-in, executing the script before absorbing any enviroment changes it effects:
```javascript
var source = require('shell-source');

source(__dirname + '/env.sh', function(err) {
  if (err) return console.error(err);

  console.log(process.env.SERVER_HOST); // ::
  console.log(process.env.SERVER_PORT); // 8080
  console.log(process.env.PATH);        // node_modules/.bin:/usr/local/bin
});
```

## Install
```bash
$ npm install shell-source
```

## Test
```bash
$ npm test
```

## Require
#### `var source = require('shell-source');`

## Use
#### `source(filepath, [opts,] callback);`
* `filepath` The full path to the shell script that should be sourced.
* `opts` An options object which can contain:
  * `source` A boolean. Defaults to `true`. If set to `false`, the callback can receive the evironment object as its second argument and `process.env` will be left unmolested.  
  * `wrapper` Use your own wrapper script. [`source.sh`](https://github.com/jessetane/shell-source/blob/master/source.sh) is used by default.
  * `reserved` An object to merge with the default [blacklist](https://github.com/jessetane/shell-source/blob/master/index.js#L5) where `SHLVL` and `_` are already set to `true`.
* `callback` A callback with signature:
```javascript
function(err, environment) {
  // console.log(err, environment);
}
```

## Notes
Obviously it would be nice if this could be done synchronously. However, until something like [this](http://strongloop.com/strongblog/whats-new-in-node-js-v0-12-execsync-a-synchronous-api-for-child-processes) lands on stable, I'm not sure if there is a sane way to accomplish it. If there is, please let me know.

## Releases
The latest stable release is published to [npm](https://www.npmjs.org/package/shell-source). Tarballs for each release can be found [here](https://github.com/jessetane/shell-source/releases).
* [1.1.0](https://github.com/jessetane/shell-source/releases/tag/1.1.0)
 * xtend is not a dev dependency (thanks @sparkleholic)
* [1.0.x](https://github.com/jessetane/shell-source/releases/tag/1.0.1)
 * First release.

## License
Copyright © 2014 Jesse Tane <jesse.tane@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [WTFPL](http://www.wtfpl.net/txt/copying).

No Warranty. The Software is provided "as is" without warranty of any kind, either express or implied, including without limitation any implied warranties of condition, uninterrupted use, merchantability, fitness for a particular purpose, or non-infringement.
