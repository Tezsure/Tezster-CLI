var tape = require('tape');
var xtend = require('xtend');
var source = require('../');

var envBefore = xtend({}, process.env);

tape('source target does not exist', function(t) {
  t.plan(3);

  source(__dirname + '/bogus.sh', function(err, env) {
    t.ok(err, 'error was passed to callback');
    t.notOk(env, 'env object was not passed to callback');

    var diff = mkdiff(envBefore, process.env);
    t.equals(Object.keys(diff).length, 0, 'process environment was not modified');
  });
});

tape('opts.wrapper does not exist', function(t) {
  t.plan(3);

  source(__dirname + '/fixture.sh', { wrapper: __dirname + '/bogus.sh' }, function(err, env) {
    t.ok(err, 'error was passed to callback');
    t.notOk(env, 'env object was not passed to callback');

    var diff = mkdiff(envBefore, process.env);
    t.equals(Object.keys(diff).length, 0, 'process environment was not modified');
  });
});

tape('opts.source = false', function(t) {
  t.plan(4);

  source(__dirname + '/fixture.sh', { source: false }, function(err, env) {
    t.error(err, 'error was not passed to callback');
    t.ok(env, 'env object was passed to callback');

    var diff = mkdiff(envBefore, process.env);
    t.equals(Object.keys(diff).length, 0, 'process environment was not modified');

    var diff = mkdiff(env, process.env);
    t.equals(Object.keys(diff).length, 3, 'number of env object keys diff matches expected');
  });
});

tape('opts.reserved', function(t) {
  t.plan(4);

  var opts = {
    source: false, 
    reserved: { 'PATH': true, 'SHLVL': false }
  };

  source(__dirname + '/fixture.sh', opts, function(err, env) {
    t.error(err, 'error was not passed to callback');
    t.ok(env, 'env object was passed to callback');

    var diff = mkdiff(envBefore, process.env);
    t.equals(Object.keys(diff).length, 0, 'process environment was not modified');

    var diff = mkdiff(env, process.env);
    t.equals(Object.keys(diff).length, 3, 'number of env object keys diff matches expected');
  });
});

tape('opts.source = true', function(t) {
  t.plan(3);

  source(__dirname + '/fixture.sh', function(err, env) {
    t.error(err, 'error was not passed to callback');
    t.notOk(env, 'env object was not passed to callback');

    var diff = mkdiff(envBefore, process.env);
    t.equals(Object.keys(diff).length, 3, 'process environment was modified as expected');
  });
});

function mkdiff(obj1, obj2) {
  var diff = {};
  for (var i in obj2) {
    if (obj1[i] !== obj2[i]) {
      diff[i] = obj2[i];
    }
  }
  return diff;
}
