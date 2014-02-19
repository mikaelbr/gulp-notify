var api = require('./lib/extra_api');

"use strict";

// Expose plugin
module.exports = require('./lib/notify');

// Expose onError behaviour
module.exports.onError = api.onError;

// Expose to set log level
module.exports.logLevel = api.logLevel;

// Expose to set new logger
module.exports.logger = api.logger;

// Syntactiv sugar
module.exports.withReporter = require('./lib/withReporter');
