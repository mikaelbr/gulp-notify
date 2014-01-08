var es = require("event-stream"),
    path = require("path"),
    notifier = require("node-notifier");

module.exports = function (options) {
  "use strict";
  options = options || {};
  var reporter = options.notifier || notifier.notify;
  function notify(file, callback) {
    var message = file.path, title = "Gulp notification";

    if (!reporter) {
      return callback(new Error("gulp-notify: No reporter specified."), undefined);
    }

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

    reporter({
      title: title,
      message: message
    }, function (err) {
      if (err) return callback(err);
      callback(null, file);
    });
  }

  return es.map(notify);
};
