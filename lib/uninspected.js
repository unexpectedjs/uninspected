/*global console, navigator*/
const unexpected = require('unexpected').clone();

const originalConsole = console; // Take a copy so we don't loop infinitely when someone goes: console=uninspected;console.log('foo');

unexpected.installPlugin(require('magicpen-prism'));

function uninspected() {
  // ...
  return uninspected.log.apply(uninspected, arguments);
}

uninspected.inspect = (obj, options) => {
  if (!options || typeof options !== 'object') {
    options = {};
  }
  const depth =
    options.depth === null
      ? Infinity
      : options.depth || uninspected.defaultDepth;
  // We add one because unexpected.inspect includes the first level in the depth, and we want
  // to be compatible with require('util').inspect:
  return unexpected
    .createOutput(uninspected.outputFormat)
    .appendInspected(obj, depth + 1)
    .toString();
};

uninspected.defaultDepth = 6; // util's default level of 2 is annoyingly low
uninspected.output = unexpected.output;
uninspected.createOutput = unexpected.createOutput;
uninspected.outputFormat = unexpected.outputFormat();

if (uninspected.outputFormat === 'html') {
  uninspected.outputFormat = 'text';
}

const isChrome =
  typeof navigator !== 'undefined' &&
  navigator &&
  typeof navigator.userAgent === 'string' &&
  /chrome/i.test(navigator.userAgent);

function createOutput() {
  return uninspected.createOutput(
    isChrome ? 'coloredConsole' : uninspected.outputFormat
  );
}

['log', 'info', 'warn', 'error'].forEach(methodName => {
  uninspected[methodName] = function() {
    // ...
    const output = createOutput();
    Array.prototype.forEach.call(arguments, (obj, i) => {
      if (i > 0) {
        output.sp();
      }
      if (typeof obj === 'string') {
        output.text(obj);
      } else if (obj && obj.isMagicPen) {
        output.append(obj);
      } else {
        output.appendInspected(obj, uninspected.defaultDepth);
      }
    });
    if (isChrome) {
      originalConsole[methodName].apply(originalConsole, output.toString());
    } else {
      originalConsole[methodName](output.toString());
    }
  };
});

uninspected.dir = originalConsole.dir.bind(originalConsole);

uninspected.assert = subject => {
  unexpected(subject, 'to be truthy');
};

uninspected.diff = (a, b) => {
  const result = unexpected.diff(a, b, createOutput());
  if (result && result.diff) {
    uninspected.log(result.diff);
  } else if (unexpected.equal(a, b)) {
    uninspected.log(a);
  } else {
    uninspected.log(
      unexpected.output
        .clone()
        .text('-')
        .append(unexpected.inspect(a))
        .nl()
        .text('+')
        .append(unexpected.inspect(b))
    );
  }
};

// Support trace, time, timeEnd etc.
Object.keys(originalConsole).forEach(key => {
  if (typeof originalConsole[key] === 'function' && !uninspected[key]) {
    uninspected[key] = function() {
      // ...
      return originalConsole[key].apply(originalConsole, arguments);
    };
  }
});

uninspected.addType = function() {
  // ...
  return unexpected.addType.apply(unexpected, arguments);
};

uninspected.addStyle = function() {
  // ...
  return unexpected.output.addStyle.apply(unexpected.output, arguments);
};

uninspected.installPlugin = function() {
  // ...
  return unexpected.installPlugin.apply(unexpected, arguments);
};

module.exports = uninspected;
