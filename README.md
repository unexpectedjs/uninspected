uninspected
===========

Replacement for util.inspect and the console object.

[![NPM version](https://badge.fury.io/js/messy.png)](http://badge.fury.io/js/uninspected)
[![Build Status](https://travis-ci.org/papandreou/uninspected.png)](https://travis-ci.org/papandreou/uninspected)
[![Coverage Status](https://coveralls.io/repos/papandreou/uninspected/badge.png)](https://coveralls.io/r/papandreou/uninspected)
[![Dependency Status](https://david-dm.org/papandreou/uninspected.png)](https://david-dm.org/papandreou/uninspected)

```javascript
var uninspected = require('uninspected');

var str = uninspected.inspect({foo: 'bar'}); // "{ foo: 'bar' }"

uninspected.log('foo', {bar: /hey/}); // { bar: /hey/ }

// Or use this shorthand:
uninspected('foo', {bar: /hey/}); // { bar: /hey/ }
```

You can also use it instead of the console object:

```javascript
var console = require('uninspected');

console.log('...');

console.trace();
```

Also includes diffing support:

```javascript
uninspected.diff({foo: 'bar'}, {foo: 'baz'});
{
  foo: 'bar' // should be 'baz'
             // -bar
             // +baz
}
```
