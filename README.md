uninspected
===========

Replacement for util.inspect and the console object.

[![NPM version](https://badge.fury.io/js/messy.png)](http://badge.fury.io/js/uninspected)
[![Build Status](https://travis-ci.org/papandreou/uninspected.png)](https://travis-ci.org/papandreou/uninspected)
[![Coverage Status](https://coveralls.io/repos/papandreou/uninspected/badge.png)](https://coveralls.io/r/papandreou/uninspected)
[![Dependency Status](https://david-dm.org/papandreou/uninspected.png)](https://david-dm.org/papandreou/uninspected)

```javascript
var uninspected = require('uninspected');

var str = uninspected({foo: 'bar'}); // "{ foo: 'bar' }"

uninspected.log('foo', {bar: /hey/});
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
