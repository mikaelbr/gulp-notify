var through = require("through2");
var report = require('./report');
var Notification = require("node-notifier");

"use strict";

module.exports = function (options) {
  var reporter;

  options = options || {};
  var templateOptions = options.templateOptions || {};

  if (options.notifier) {
    reporter = options.notifier;
  } else {
    var notifier = new Notification(options);
    var reporter = notifier.notify.bind(notifier);
  }
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
