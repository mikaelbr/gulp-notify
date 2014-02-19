
var gulp = require('gulp');
var notify = require('../');
var through = require('through2');
var plumber = require('gulp-plumber');

gulp.task("multiple", function () {
  gulp.src("../test/fixtures/*")
      .pipe(notify());
});

gulp.task("one", function () {
  gulp.src("../test/fixtures/1.txt")
      .pipe(notify());
});

gulp.task("message", function () {
  gulp.src("../test/fixtures/1.txt")
      .pipe(notify("This is a message."));
});


gulp.task("customReporter", function () {
  var custom = notify.withReporter(function (options, callback) {
    console.log("Title:", options.title);
    console.log("Message:", options.message);
    callback();
  });

  gulp.src("../test/fixtures/1.txt")
      .pipe(custom("This is a message."));
});

gulp.task("template", function () {
  gulp.src("../test/fixtures/1.txt")
      .pipe(notify("Template: <%= file.relative %>"));
});


gulp.task("templateadv", function () {
  gulp.src("../test/fixtures/1.txt")
      .pipe(notify({
        message: "Template: <%= file.relative %>",
        title: function (file) {
          if(file.isNull()) {
            return "Folder:";
          }
          return "File: <%= file.relative %> <%= options.extra %>";
        },
        templateOptions: {
          extra: "foo"
        }
      }));
});

gulp.task("function", function () {
  gulp.src("../test/fixtures/1.txt")
      .pipe(notify(function(file) {
          return "Some file: " + file.relative;
      }));
});

gulp.task("onlast", function () {
  gulp.src("../test/fixtures/*")
      .pipe(notify({
        onLast: true,
        message: function(file) {
          return "Some file: " + file.relative;
        }
      }));
});

gulp.task("error", function () {
  gulp.src("../test/fixtures/*")
      .pipe(through.obj(function (file, enc, callback) {
        this.emit("error", new Error("Something happend: Error message!"));
        callback();
      }))
      .on("error", notify.onError('Error: <%= error.message %>'))
      .on("error", function (err) {
        console.log("Error:", err);
      })
});

gulp.task("customError", function () {

  var custom = notify.withReporter(function (options, callback) {
    console.log("Title:", options.title);
    console.log("Message:", options.message);
    callback();
  });

  custom.setLogLevel(1);

  gulp.src("../test/fixtures/*")
      .pipe(custom('<%= file.relative %>'))
      .pipe(through.obj(function (file, enc, callback) {
        this.emit("error", new Error("Something happend: Error message!"));
        callback();
      }))
      .on("error", custom.onError('Error: <%= error.message %>'))
      .on("error", function (err) {
        console.log("Error:", err);
      })
});

