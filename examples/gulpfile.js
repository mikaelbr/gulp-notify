
var gulp = require('gulp');
var notify = require('../');
var through = require('through2');

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
      .pipe(through.obj(function () {
        this.emit("error", "Something happend: Error message!")
      }))
      .on("error", notify.onError())
      .on("error", function (err) {
        console.log("Error:", err);
      })
});
