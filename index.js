var through = require("through2"),
    path = require("path"),
    gutil = require("gulp-util"),
    notifier = require("node-notifier");

"use strict";

var plugin = module.exports = function (options) {

  options = options || {};

  var reporter = options.notifier || notifier.notify;
  var lastFile = null;

  function notify (file, enc, callback) {
    var stream = this;
    stream.pause();

    report(reporter, file, options, function (err) {
      if (err) {
        stream.emit("error", err);
      } else {
        stream.push(file);
      }
      stream.resume();
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

    report(reporter, lastFile, options, function (err, file) {
      if (err) {
        stream.emit("error", err);
        return callback();
      }
    });
    lastFile = null; // reset
    return callback();
  });
};

module.exports.onError = function (options) {
  options = options || {};

  var reporter = options.notifier || notifier.notify;

  return function (error) {
    report(reporter, error, options);
  };
};


function report (reporter, message, options, callback) {
  var self = this;
  callback = callback || function () {};
  if (!reporter) return callback(new gutil.PluginError("gulp-notify", "No reporter specified."));

  // Try/catch the only way to go to ensure catching all errors? Domains?
  try {
    reporter(constructOptions(options, message), function (err) {
      if (err) return callback(new gutil.PluginError("gulp-notify", err));
      return callback();
    });
  } catch (err) {
    return callback(new gutil.PluginError("gulp-notify", err));
  }
}

function constructOptions (options, object) {
  var message = object.path || object.message || object,
      title = "Gulp notification";

  if (object.message) {
    title = "Error in Gulpfile";
  }

  if (typeof options === "function") {
    message = options(object);
  }

  if (typeof options === "object") {
    if (typeof options.title === "function") {
      title = options.title(object);
    } else {
      title = options.title || title;
    }

    if (typeof options.message === "function") {
      message = options.message(object);
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
