var spawn = require('child_process').spawn;
var concat = require('concat-stream');
var xtend = require('xtend');

var reserved = {
  'SHLVL': true,
  '_': true,
};

module.exports = function(filename, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  if (opts.source === undefined) {
    opts.source = true;
  }

  if (!opts.wrapper) {
    opts.wrapper = __dirname + '/source.sh';
  }

  if (!opts.reserved) {
    opts.reserved = xtend(reserved, opts.reserved);
  }
  else {
    opts.reserved = xtend(reserved);
  }

  var env = {};
  var count = 0;
  var status = null;
  var stdout = null;
  var stderr = null;
  var proc = spawn(opts.wrapper, [ filename ]);
  
  proc.on('error', function(err) {
    cb(err);
    cb = null;
  });

  proc.on('exit', function(code) {
    status = code;
    ++count === 3 && done();
  });

  proc.stdout.pipe(concat(function(data) {
    stdout = data;
    ++count === 3 && done();
  }));

  proc.stderr.pipe(concat(function(data) {
    stderr = data;
    ++count === 3 && done();
  }));

  function done() {
    if (!cb) return;

    if (status === 0) {
      var envstring = stdout.toString().split('\n');

      for (var i=0; i<envstring.length; i++) {
        var line = envstring[i];
        var delim = line.indexOf('=');
        var key = line.slice(0, delim);
        var val = line.slice(delim + 1);
        
        if (key && !opts.reserved[key]) {
          if (opts.source) process.env[key] = val;
          else env[key] = val;
        }
      }

      if (opts.source) cb();
      else cb(null, env);
    }
    else {
      var error = new Error(stderr);
      error.code = status;
      cb(error);
    }
  }
};
