var through = require("through2"),
    gutil = require("gulp-util"),
    template = require("lodash.template"),
    notifier = require("node-notifier");

"use strict";

var logLevel = 2;
var fnLog = gutil.log;

var plugin = module.exports = function (options) {

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

var onError = module.exports.onError = function (options) {
  options = options || {};
  var reporter = options.notifier || notifier.notify;
  return function (error) {
    report(reporter, error, options);
  };
};

var setLogLevel = module.exports.setLogLevel = function (newLogLevel) {
  logLevel = newLogLevel;
};

var logger = module.exports.logger = function (newLogger) {
  if (!newLogger) return fnLog;
  fnLog = newLogger;
};

module.exports.withReporter = function (reporter) {
  if (!reporter) throw new gutil.PluginError("gulp-notify", "No custom reporter defined.");

  var inner = function (options) {
    options = options || {};

    if (typeof options !== "object") {
      options = {
        message: options
      };
    }

    options.notifier = reporter;
    return plugin(options);
  };

  inner.onError = function (options) {
    options = options || {};

    if (typeof options !== "object") {
      options = {
        message: options
      };
    }

    options.notifier = reporter;
    return onError(options);
  }

  inner.setLogLevel = setLogLevel;
  inner.logger = logger;

  return inner;
};


function logError (options, isError) {
  if (!logLevel) return;
  if (logLevel === 1 && !isError) return;

  color = isError ? "red" : "green";
  if (!gutil.colors[color]) return;
  fnLog(gutil.colors.cyan('gulp-notify') + ':',
           '[' + gutil.colors.blue(options.title) + ']',
            gutil.colors[color].call(gutil.colors, options.message)
           );
}

function report (reporter, message, options, templateOptions, callback) {
  var self = this;
  callback = callback || function () {};
  if (!reporter) return callback(new gutil.PluginError("gulp-notify", "No reporter specified."));

  // Try/catch the only way to go to ensure catching all errors? Domains?
  try {
    var options = constructOptions(options, message, templateOptions);
    logError(options, (message instanceof Error));
    reporter(options, function (err) {
      if (err) return callback(new gutil.PluginError("gulp-notify", err));
      return callback();
    });
  } catch (err) {
    return callback(new gutil.PluginError("gulp-notify", err));
  }
}

function constructOptions (options, object, templateOptions) {
  var message = object.path || object.message || object,
      title = !(object instanceof Error) ? "Gulp notification" : "Error running Gulp";

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

  if (object instanceof Error) {
    var titleTemplate = template(title);
    var messageTemplate = template(message);
    return {
      title: titleTemplate({
        error: object,
        options: templateOptions
      }),
      message: messageTemplate({
        error: object,
        options: templateOptions
      })
    };
  }

  return {
    title: gutil.template(title, {
      file: object,
      options: templateOptions
    }),
    message: gutil.template(message, {
      file: object,
      options: templateOptions
    })
  };
}
