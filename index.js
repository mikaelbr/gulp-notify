var through = require("through"),
    path = require("path"),
    gutil = require("gulp-util"),
    notifier = require("node-notifier");

module.exports = function (options) {
  "use strict";

  options = options || {};

  var reporter = options.notifier || notifier.notify;
  var lastFile = null;

  function notify (file) {
    var stream = this;
    stream.pause();

    report(file, function (err) {
      if (err) {
        stream.emit("error", err);
      } else {
        stream.emit("data", file);
      }
      stream.resume();
    });
  }

  if (!options.onLast) {
    return through(notify);
  }

  // Only send notification on the last file.
  return through(function (file) {
    lastFile = file;
    this.emit("data", file)
  }, function () {
    var stream = this;

    if (!lastFile) {
      return stream.emit("end");
    }

    report(lastFile, function (err, file) {
      if (err) stream.emit("error", err);
    });
    lastFile = null; // reset
    stream.emit("end");
  });

  function report (file, callback) {
    var self = this;
    if (!reporter) return callback(new gutil.PluginError("gulp-notify", "No reporter specified."));

    // Try/catch the only way to go to ensure catching all errors? Domains?
    try {
      reporter(constructOptions(options, file), function (err) {
        if (err) return callback(new gutil.PluginError("gulp-notify", err));
        return callback();
      });
    } catch (err) {
      return callback(new gutil.PluginError("gulp-notify", err));
    }
  }

  function constructOptions (options, file) {
    var message = file.path, title = "Gulp notification";

    if (typeof options === "function") {
      message = options(file);
    }

    if (typeof options === "object") {
      if (typeof options.title === "function") {
        title = options.title(file);
      } else {
        title = options.title || title;
      }

      if (typeof options.message === "function") {
        message = options.message(file);
      } else {
        message = options.message || message;
      }
    }

    if (typeof options === "string") {
      message = options;
    }

    return {
      title: title,
      message: message
    };
  }
};
