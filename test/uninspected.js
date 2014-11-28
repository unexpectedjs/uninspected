/*global describe, it, console*/

var uninspected = require('../lib/uninspected'),
    unexpected = require('unexpected'),
    sinon = require('sinon');

describe('uninspected', function () {
    var expect = unexpected.clone().installPlugin(require('unexpected-sinon'));

    describe('#inspect', function () {
        it('should produce colored output', function () {
            expect(uninspected.inspect({foo: 'abc'}), 'to equal', "{ foo: \x1B[36m\x1B[38;5;44m'abc'\x1B[39m }");
        });

        it('should have a default depth of 4', function () {
            expect(uninspected.inspect({foo: {foo: {foo: {foo: {foo: {foo: 123}}}}}}), 'to equal', '{ foo: { foo: { foo: { foo: { foo: ... } } } } }');
        });
    });

    it('should be a shorthand for uninspected.log', function () {
        sinon.stub(console, 'log');
        uninspected('abc', {foo: true});
        expect(console.log, 'was called with', 'abc { foo: true }');
        console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
    });

    describe('#log', function () {
        var originalOutputFormat = uninspected.outputFormat;
        beforeEach(function () {
            sinon.stub(console, 'log');
        });

        afterEach(function () {
            uninspected.outputFormat = originalOutputFormat;
        });

        it('should log to the console', function () {
            uninspected.log('abc', {foo: true});
            expect(console.log, 'was called with', 'abc { foo: true }');
            console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
        });

        it('should log with colors if told to', function () {
            uninspected.outputFormat = 'ansi';
            uninspected.log('abc', {foo: 'abc'});
            expect(console.log.args[0], 'to equal', ["abc { foo: \x1B[36m\x1B[38;5;44m'abc'\x1B[39m }"]);
            console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
        });

        it('should log without colors if told to', function () {
            uninspected.outputFormat = 'text';
            uninspected.log('abc', {foo: 'abc'});
            expect(console.log.args[0], 'to equal', ["abc { foo: 'abc' }"]);
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
            expect(console.log, 'was called with',
                "{\n" +
                "  foo: 'bar' // should be 'baz'\n" +
                "             // -bar\n" +
                "             // +baz\n" +
                "}"
            );
            console.log.restore(); // Cannot do this in an afterEach as it'll suppress mocha's output
        });
    });
});
