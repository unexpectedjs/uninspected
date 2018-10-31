/*global describe, it, console, beforeEach, afterEach*/

const uninspected = require('../lib/uninspected');

const unexpected = require('unexpected');

const sinon = require('sinon');

describe('uninspected', () => {
  const expect = unexpected.clone().installPlugin(require('unexpected-sinon'));
  const originalOutputFormat = uninspected.outputFormat;

  afterEach(() => {
    uninspected.outputFormat = originalOutputFormat;
  });

  describe('#inspect', () => {
    it('should produce colored output', () => {
      expect(
        uninspected.inspect({ foo: 'abc' }),
        'to equal',
        "{ \u001b[90m\u001b[38;5;242mfoo\u001b[39m: \u001b[36m'abc'\u001b[39m }"
      );
    });

    it('should have a default depth of 6', () => {
      uninspected.outputFormat = 'text';
      expect(
        uninspected.inspect({
          foo: {
            foo: { foo: { foo: { foo: { foo: { foo: { foo: 123 } } } } } }
          }
        }),
        'to equal',
        '{ foo: { foo: { foo: { foo: { foo: { foo: { foo: ... } } } } } } }'
      );
    });
  });

  it('should be a shorthand for uninspected.log', () => {
    uninspected.outputFormat = 'text';
    sinon.stub(console, 'log');
    uninspected('abc', { foo: true });
    expect(console.log, 'was called with', 'abc { foo: true }');
    console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
  });

  describe('#log', () => {
    beforeEach(() => {
      sinon.stub(console, 'log');
    });

    it('should log to the console', () => {
      uninspected.outputFormat = 'text';
      uninspected.log('abc', { foo: true });
      expect(console.log, 'was called with', 'abc { foo: true }');
      console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
    });

    it('should log with colors if told to', () => {
      uninspected.outputFormat = 'ansi';
      uninspected.log('abc', { foo: 'abc' });
      expect(console.log.args[0], 'to equal', [
        "abc { \u001b[90m\u001b[38;5;242mfoo\u001b[39m: \u001b[36m'abc'\u001b[39m }"
      ]);
      console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
    });

    it('should log without colors if told to', () => {
      uninspected.outputFormat = 'text';
      uninspected.log('abc', { foo: 'abc' });
      expect(console.log.args[0], 'to equal', ["abc { foo: 'abc' }"]);
      console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
    });
  });

  describe('#diff', () => {
    beforeEach(() => {
      sinon.stub(console, 'log');
    });

    it('should log without colors if told to', () => {
      uninspected.outputFormat = 'text';
      uninspected.diff({ foo: 'bar' }, { foo: 'baz' });
      try {
        expect(console.log, 'to have calls satisfying', () => {
          console.log(
            '{\n' +
              "  foo: 'bar' // should equal 'baz'\n" +
              '             //\n' +
              '             // -bar\n' +
              '             // +baz\n' +
              '}'
          );
        });
      } finally {
        console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
      }
    });

    it('should do something reasonable when diffing primitive values with no specific built-in diff', () => {
      uninspected.outputFormat = 'text';
      uninspected.diff(123, 456);
      try {
        expect(console.log, 'to have calls satisfying', () => {
          console.log('-123\n' + '+456');
        });
      } finally {
        console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
      }
    });
  });
});
