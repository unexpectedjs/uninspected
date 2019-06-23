const unexpected = require('unexpected')
  .clone()
  .use(require('magicpen-prism'));
const originalConsole = console; // Take a copy so we don't loop infinitely when someone goes: console=uninspected;console.log('foo');

function uninspected(...args) {
  return uninspected.log.apply(uninspected, args);
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

for (const methodName of ['log', 'info', 'warn', 'error']) {
  uninspected[methodName] = function(...args) {
    const output = createOutput();
    for (const [i, obj] of args.entries()) {
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
    }
    if (isChrome) {
      originalConsole[methodName].apply(originalConsole, output.toString());
    } else {
      originalConsole[methodName](output.toString());
    }
  };
}

uninspected.dir = originalConsole.dir.bind(originalConsole);

uninspected.assert = subject => {
  unexpected(subject, 'to be truthy');
};

uninspected.diff = (a, b) => {
  const result = unexpected.diff(a, b, createOutput());
  if (result) {
    uninspected.log(result);
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
for (const key of Object.keys(originalConsole)) {
  if (typeof originalConsole[key] === 'function' && !uninspected[key]) {
    uninspected[key] = function(...args) {
      return originalConsole[key].apply(originalConsole, args);
    };
  }
}

uninspected.addType = function(...args) {
  return unexpected.addType.apply(unexpected, args);
};

uninspected.addStyle = function(...args) {
  return unexpected.output.addStyle.apply(unexpected.output, args);
};

uninspected.use = function(...args) {
  return unexpected.use.apply(unexpected, args);
};

module.exports = uninspected;
