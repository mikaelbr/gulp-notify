var through = require("through2");
var report = require('./report');
var notifier = require("node-notifier");

"use strict";

module.exports = function (options) {

  options = options || {};
  var templateOptions = options.templateOptions || {};

  var reporter = options.notifier || notifier.notify;
  var lastFile = null;

  function notify (file, enc, callback) {
    var stream = this;

    report(reporter, file, options, templateOptions, function (err) {
      err && stream.emit("error", err);
      stream.push(file);
      callback();
    });
  }

  if (!options.onLast) {
    return through.obj(notify);
  }

  // Only send notification on the last file.
  return through.obj(function (file, enc, callback) {
    lastFile = file;
    this.push(file);
    callback();
  }, function (callback) {
    var stream = this;

    if (!lastFile) {
      return callback();
    }

    report(reporter, lastFile, options, templateOptions, function (err, file) {
      if (err) {
        stream.emit("error", err);
        return callback();
      }
    });
    lastFile = null; // reset
    return callback();
  });
};
