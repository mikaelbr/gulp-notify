var es = require("event-stream"),
    path = require("path"),
    gutil = require("gulp-util"),
    notifier = require("node-notifier");

module.exports = function (options) {
  "use strict";
  options = options || {};
  var reporter = options.notifier || notifier.notify;
  var lastFile = null;

  function notify(file, callback) {
    callback = callback || function () {};
    if (!reporter) {
      return callback(new gutil.PluginError("gulp-notify", "No reporter specified."), undefined);
    }
    reporter(constructOptions(options, file), function (err) {
      if (err) return callback(new gutil.PluginError("gulp-notify", err));
      callback(null, file);
    });
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

  if (!options.onLast) {
    return es.map(notify);
  }

  // Only send notification on the last file.
  return es.through(function (file) {
    lastFile = file;
    this.emit("data", file)
  }, function () { //optional
    var stream = this;
    notify(lastFile, function (err, file) {
      if (err) stream.emit("error", err);
    });
    lastFile = null; // reset
    stream.emit("end");
  });
};
