
var gulp = require('gulp');
var notify = require('../');

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