/*global describe, it, console, beforeEach, afterEach*/

var uninspected = require('../lib/uninspected'),
    unexpected = require('unexpected'),
    sinon = require('sinon');

describe('uninspected', function () {
    var expect = unexpected.clone().installPlugin(require('unexpected-sinon'));
    var originalOutputFormat = uninspected.outputFormat;

    afterEach(function () {
        uninspected.outputFormat = originalOutputFormat;
    });

    describe('#inspect', function () {
        it('should produce colored output', function () {
            expect(uninspected.inspect({foo: 'abc'}), 'to equal', '{ \u001b[90m\u001b[38;5;242mfoo\u001b[39m: \u001b[36m\'abc\'\u001b[39m }');
        });

        it('should have a default depth of 6', function () {
            uninspected.outputFormat = 'text';
            expect(uninspected.inspect({foo: {foo: {foo: {foo: {foo: {foo: {foo: {foo: 123}}}}}}}}), 'to equal',
                '{ foo: { foo: { foo: { foo: { foo: { foo: { foo: ... } } } } } } }');
        });
    });

    it('should be a shorthand for uninspected.log', function () {
        uninspected.outputFormat = 'text';
        sinon.stub(console, 'log');
        uninspected('abc', {foo: true});
        expect(console.log, 'was called with', 'abc { foo: true }');
        console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
    });

    describe('#log', function () {
        beforeEach(function () {
            sinon.stub(console, 'log');
        });

        it('should log to the console', function () {
            uninspected.outputFormat = 'text';
            uninspected.log('abc', {foo: true});
            expect(console.log, 'was called with', 'abc { foo: true }');
            console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
        });

        it('should log with colors if told to', function () {
            uninspected.outputFormat = 'ansi';
            uninspected.log('abc', {foo: 'abc'});
            expect(console.log.args[0], 'to equal', ['abc { \u001b[90m\u001b[38;5;242mfoo\u001b[39m: \u001b[36m\'abc\'\u001b[39m }']);
            console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
        });

        it('should log without colors if told to', function () {
            uninspected.outputFormat = 'text';
            uninspected.log('abc', {foo: 'abc'});
            expect(console.log.args[0], 'to equal', ['abc { foo: \'abc\' }']);
            console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
        });
    });

    describe('#diff', function () {
        beforeEach(function () {
            sinon.stub(console, 'log');
        });

        it('should log without colors if told to', function () {
            uninspected.outputFormat = 'text';
            uninspected.diff({foo: 'bar'}, {foo: 'baz'});
            try {
                expect(console.log, 'to have calls satisfying', function () {
                    console.log(
                        '{\n' +
                        '  foo: \'bar\' // should equal \'baz\'\n' +
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

        it('should do something reasonable when diffing primitive values with no specific built-in diff', function () {
            uninspected.outputFormat = 'text';
            uninspected.diff(123, 456);
            try {
                expect(console.log, 'to have calls satisfying', function () {
                    console.log(
                        '-123\n' +
                        '+456'
                    );
                });
            } finally {
                console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
            }
        });
    });
});
