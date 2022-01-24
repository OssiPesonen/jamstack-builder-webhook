const util = require('util');

const consoleFunctions = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: (console.debug || console.log).bind(console)
};

function prefix (fn) {
  Object.keys(consoleFunctions).forEach(function (k) {
    console[k] = function () {
      const s = typeof fn === 'function' ? fn(k) : fn;
      arguments[0] = util.format(s, arguments[0]);
      consoleFunctions[k].apply(console, arguments);
    };
  });
}

// the default date format to print
function timestamp (consoleFnKey) {
  return `[${consoleFnKey.slice(0, 1).toUpperCase()}] - [${new Date().toISOString()}]`;
}

prefix(timestamp);