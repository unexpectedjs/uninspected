/*global console*/
var unexpected = require('unexpected').clone();

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

uninspected.defaultDepth = 4; // util's default level of 2 is annoyingly low
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
            console[methodName].apply(console, output.toString('coloredConsole'));
        } else {
            console[methodName](output.toString(uninspected.outputFormat));
        }
    };
});

uninspected.dir = uninspected.log;

uninspected.diff = function (a, b) {
    var result = unexpected.diff(a, b);
    if (result && result.diff) {
        uninspected.log(result.diff);
    } else {
        uninspected.log(a);
    }
};

// Support trace, time, timeEnd etc.
Object.keys(console).forEach(function (key) {
    if (typeof console[key] === 'function' && !uninspected[key]) {
        uninspected[key] = function () { // ...
            return console[key].apply(console, arguments);
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
