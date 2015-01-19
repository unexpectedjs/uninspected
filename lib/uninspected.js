/*global console, navigator*/
var unexpected = require('unexpected').clone();

var originalConsole = console; // Take a copy so we don't loop infinitely when someone goes: console=uninspected;console.log('foo');

unexpected.output.installPlugin(require('magicpen-prism'));

function uninspected() { // ...
    return uninspected.log.apply(uninspected, arguments);
}

uninspected.inspect = function (obj, options) {
    if (!options || typeof options !== 'object') {
        options = {};
    }
    var depth = options.depth === null ? Infinity : options.depth || uninspected.defaultDepth;
    // We add one because unexpected.inspect includes the first level in the depth, and we want
    // to be compatible with require('util').inspect:
    return unexpected.inspect(obj, depth + 1).toString(uninspected.outputFormat);
};

uninspected.defaultDepth = 6; // util's default level of 2 is annoyingly low
uninspected.output = unexpected.output;
uninspected.outputFormat = unexpected.outputFormat();

if (uninspected.outputFormat === 'html') {
    uninspected.outputFormat = 'text';
}

var isChrome = typeof navigator !== 'undefined' && navigator && typeof navigator.userAgent === 'string' && /chrome/i.test(navigator.userAgent);

['log', 'info', 'warn', 'error'].forEach(function (methodName) {
    uninspected[methodName] = function () { // ...
        var output = uninspected.output.clone();
        Array.prototype.forEach.call(arguments, function (obj, i) {
            if (i > 0) {
                output.sp();
            }
            if (typeof obj === 'string') {
                output.text(obj);
            } else if (obj && obj.isMagicPen) {
                output.append(obj);
            } else {
                output.append(unexpected.inspect(obj, uninspected.defaultDepth));
            }
        });
        if (isChrome) {
            originalConsole[methodName].apply(originalConsole, output.toString('coloredConsole'));
        } else {
            originalConsole[methodName](output.toString(uninspected.outputFormat));
        }
    };
});

uninspected.dir = originalConsole.dir.bind(originalConsole);

uninspected.assert = function (subject) {
    unexpected(subject, 'to be truthy');
};

uninspected.diff = function (a, b) {
    var result = unexpected.diff(a, b);
    if (result && result.diff) {
        uninspected.log(result.diff);
    } else if (unexpected.equal(a, b)) {
        uninspected.log(a);
    } else {
        uninspected.log(unexpected.output.clone()
            .text('-').append(unexpected.inspect(a)).nl()
            .text('+').append(unexpected.inspect(b))
        );
    }
};

// Support trace, time, timeEnd etc.
Object.keys(originalConsole).forEach(function (key) {
    if (typeof originalConsole[key] === 'function' && !uninspected[key]) {
        uninspected[key] = function () { // ...
            return originalConsole[key].apply(originalConsole, arguments);
        };
    }
});

uninspected.addType = function () { // ...
    return unexpected.addType.apply(unexpected, arguments);
};

uninspected.addStyle = function () { // ...
    return unexpected.output.addStyle.apply(unexpected.output, arguments);
};

module.exports = uninspected;
