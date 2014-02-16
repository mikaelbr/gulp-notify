/*global describe, it*/
"use strict";

var gulp = require('gulp'),
    should = require('should'),
    through = require('through2'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    join = require('path').join,
    fs = require('fs'),
    notify = require('../');

var mockGenerator = function (tester) {
  tester = tester || function () {  };
  return function (opts, callback) {
    tester(opts);
    callback();
  };
};

describe('gulp output stream', function() {
  notify.setLogLevel(0);

  describe('notify()', function() {

    it('should return a stream', function(done) {
      var stream = notify({
        notifier: mockGenerator()
      });
      should.exist(stream);
      should.exist(stream.on);
      should.exist(stream.pipe);
      done();
    });

    it('should allow setting of own reporter', function(done) {
      var notifier = notify.withReporter(mockGenerator);
      var stream = notifier();
      should.exist(stream);
      should.exist(stream.on);
      should.exist(stream.pipe);
      done();
    });

    it('should call notifier with title and message', function(done) {

      var mockedNotify = notify.withReporter(mockGenerator(function (opts) {
        should.exist(opts);
        should.exist(opts.title);
        should.exist(opts.message);
        String(opts.message).should.equal(testString);
      }));

      var testString = "this is a test",
          instream = gulp.src(join(__dirname, "./fixtures/*.txt")),
          outstream = mockedNotify({
            message: testString
          });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
      });

      outstream.on('end', function() {
        done();
      });

      instream.pipe(outstream);
    });

    it('should emit error when sub-module returns error', function(done) {
      var mockedNotify = notify.withReporter(function (options, callback) {
        callback(new Error(testString));
      });


      var testString = "testString",
          instream = gulp.src(join(__dirname, "./fixtures/*.txt")),
          outstream = mockedNotify({
            message: testString
          });

      outstream.on('error', function (error) {
        should.exist(error);
        should.exist(error.message);
        String(error.message).should.equal(testString);
        done();
      });

      instream.pipe(outstream);
    });

    it('should pass on files', function(done) {
      var mockedNotify = notify.withReporter(mockGenerator());

      var
        testSuffix = "tester",
        srcFile = join(__dirname, "./fixtures/*"),
        instream = gulp.src(srcFile),
        outstream = mockedNotify();

      var numFilesBefore = 0,
          numFilesAfter = 0;

      instream
        .pipe(through.obj(function (file, enc, cb) {
          numFilesBefore++;
          this.push(file);
          cb();
        }, function (cb) {
          numFilesBefore.should.equal(3);
          cb();
        }))
        .pipe(outstream)
        .pipe(through.obj(function (file, enc, cb) {
          numFilesAfter++;
          this.push(file);
          cb();
        }, function (callback) {
          numFilesAfter.should.equal(3);
          done();
        }));
    });

    it('should pass on files even on error in notifier (with use of plumber)', function(done) {
      var
        testString = "tester",
        srcFile = join(__dirname, "./fixtures/*"),
        instream = gulp.src(srcFile),
        outstream = notify({
          notifier: function (options, callback) {
            callback(new Error(testString));
          }
        });

      var numFilesBefore = 0,
          numFilesAfter = 0;

      instream
        .pipe(plumber())
        .pipe(through.obj(function (file, enc, cb) {
          numFilesBefore++;
          this.push(file);
          cb();
        }, function (cb) {
          numFilesBefore.should.equal(3);
          cb();
        }))
        .pipe(outstream)
        .on('error', function (error) {
          error.message.should.equal(testString);
        })
        .pipe(through.obj(function (file, enc, cb) {
          numFilesAfter++;
          this.push(file);
          cb();
        }, function (callback) {
          numFilesAfter.should.equal(3);
          done();
        }));
    });


    it('should emit error when sub-module throws exception/error', function(done) {
      var testString = "some exception",
          instream = gulp.src(join(__dirname, "./fixtures/*.txt")),
          outstream = notify({
            message: testString,
            notifier: function (options, callback) {
              throw new Error(testString);
            }
          });

      outstream.on('error', function (error) {
        should.exist(error);
        should.exist(error.message);
        String(error.message).should.equal(testString);
        done();
      });

      instream.pipe(outstream);
    });

    it('should default to notifying file path and default title', function(done) {
      var srcFile = join(__dirname, "./fixtures/1.txt");
      var instream = gulp.src(srcFile),
          outstream = notify({
            notifier: mockGenerator(function (opts) {
              should.exist(opts);
              should.exist(opts.title);
              should.exist(opts.message);
              String(opts.message).should.equal(srcFile);
              String(opts.title).should.equal("Gulp notification");
            })
          });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
      });

      outstream.on('end', function() {
        done();
      });

      instream.pipe(outstream);
    });

    it('should take function with file as argument, as message or title', function(done) {
      var
        testSuffix = "tester",
        srcFile = join(__dirname, "./fixtures/1.txt"),
        instream = gulp.src(srcFile),
        outstream = notify({
          notifier: mockGenerator(function (opts) {
            should.exist(opts);
            should.exist(opts.title);
            should.exist(opts.message);
            String(opts.message).should.equal(srcFile + testSuffix);
            String(opts.title).should.equal(srcFile + testSuffix);
          }),
          message: function (file) {
            String(file.path).should.equal(srcFile);
            return file.path + testSuffix;
          },
          title: function (file) {
            String(file.path).should.equal(srcFile);
            return file.path + testSuffix;
          }
        });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
      });

      outstream.on('end', function() {
        done();
      });

      instream.pipe(outstream);
    });

    it('should notify on all files per default', function(done) {
      var
        testSuffix = "tester",
        srcFile = join(__dirname, "./fixtures/*"),
        instream = gulp.src(srcFile),
        numFunctionCalls = 0,
        outstream = notify({
          notifier: mockGenerator(function (opts) {
            should.exist(opts);
            should.exist(opts.title);
            should.exist(opts.message);
            numFunctionCalls++;
          })
        });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
      });

      outstream.on('end', function() {
        numFunctionCalls.should.equal(3);
        done();
      });

      instream.pipe(outstream)
    });


    it('should only notify on the last file, if onLast flag is activated', function(done) {
      var
        testSuffix = "tester",
        srcFile = join(__dirname, "./fixtures/*"),
        instream = gulp.src(srcFile),
        numFunctionCalls = 0,
        outstream = notify({
          onLast: true,
          notifier: mockGenerator(function (opts) {
            should.exist(opts);
            should.exist(opts.title);
            should.exist(opts.message);
            numFunctionCalls++;
          })
        });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
      });

      outstream.on('end', function() {
        numFunctionCalls.should.equal(1);
        done();
      });

      instream.pipe(outstream);
    });


    it('should stream all files even if onLast is activated', function(done) {
      var
        testSuffix = "tester",
        srcFile = join(__dirname, "./fixtures/*"),
        instream = gulp.src(srcFile),
        outstream = notify({
          onLast: true,
          notifier: mockGenerator()
        });

      var numFilesBefore = 0,
          numFilesAfter = 0;

      instream
        .pipe(through.obj(function (file, enc, cb) {
          numFilesBefore++;
          this.push(file);
          cb();
        }, function (cb) {
          numFilesBefore.should.equal(3);
          cb();
        }))
        .pipe(outstream)
        .pipe(through.obj(function (file, enc, cb) {
          numFilesAfter++;
          this.push(file);
          cb();
        }, function (callback) {
          numFilesAfter.should.equal(3);
          done();
        }));
    });

    it('should have defined onError function on object', function (done) {
      should.exist(notify.onError);
      done();
    });

    it('should be limited by notifying on error if th onError-option is passed', function (done) {
      var
        testMessage = "tester",
        srcFile = join(__dirname, "./fixtures/*"),
        onError = notify.onError({
          notifier: mockGenerator(function (opts) {
            should.exist(opts);
            should.exist(opts.title);
            should.exist(opts.message);
            String(opts.message).should.equal(testMessage);
            String(opts.title).should.equal("Error running Gulp");
            done();
          })
        });

      gulp.src(srcFile)
        .pipe(through.obj(function (file, enc, cb) {
          this.emit("error", new gutil.PluginError("testPlugin", testMessage));
          cb();
        }))
        .on("error", onError)
    });

    it('should handle streamed files', function (done) {
      var expectedFile = new gutil.File({
        path: "test/fixtures/1.txt",
        cwd: "test/",
        base: "test/fixtures/",
        contents: fs.createReadStream("test/fixtures/1.txt")
      });

      var testString = "testString";

      var outstream = notify({
            message: testString,
            notifier: mockGenerator(function (opts) {
              should.exist(opts);
              should.exist(opts.title);
              should.exist(opts.message);
              String(opts.message).should.equal(testString);
            })
          });

      outstream.on('error', function (err) {
        should.not.exist(err);
      });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.isStream());
        should.exist(file.path);
        should.exist(file.contents);
        done();
      });

      outstream.write(expectedFile);
    });

    it('should support lodash template for titles and messages', function (done) {
      var expectedFile = new gutil.File({
        path: "test/fixtures/1.txt",
        cwd: "test/",
        base: "test/fixtures/",
        contents: fs.createReadStream("test/fixtures/1.txt")
      });

      var testString = "Template: <%= file.relative %>";
      var expectedString = "Template: 1.txt";

      var outstream = notify({
            message: testString,
            title: testString,
            notifier: mockGenerator(function (opts) {
              should.exist(opts);
              should.exist(opts.title);
              should.exist(opts.message);
              String(opts.message).should.equal(expectedString);
              String(opts.title).should.equal(expectedString);
            })
          });

      outstream.on('error', function (err) {
        should.not.exist(err);
      });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
        done();
      });

      outstream.write(expectedFile);
    });

    it('should support lodash template for titles and messages on onError', function (done) {
      var testString = "Template: <%= error.message %>";
      var expectedString = "Template: test";
      var srcFile = join(__dirname, "./fixtures/*");
      var onError = notify.onError({
            message: testString,
            title: testString,
            notifier: mockGenerator(function (opts) {
              should.exist(opts);
              should.exist(opts.title);
              should.exist(opts.message);
              String(opts.message).should.equal(expectedString);
              String(opts.title).should.equal(expectedString);
              done();
            })
          });

      gulp.src(srcFile)
        .pipe(through.obj(function (file, enc, cb) {
          this.emit("error", new gutil.PluginError("testPlugin", "test"));
          cb();
        }))
        .on('error', onError);
    });

    it('should support lodash template for titles and messages when onLast', function (done) {
      var
        testSuffix = "tester",
        srcFile = join(__dirname, "./fixtures/*"),
        instream = gulp.src(srcFile),
        numFunctionCalls = 0,
        outstream = notify({
          onLast: true,
          message: 'Template: <%= file.relative %>',
          notifier: mockGenerator(function (opts) {
            should.exist(opts);
            should.exist(opts.title);
            should.exist(opts.message);
            opts.message.should.startWith('Template:')
            opts.message.should.endWith('.txt')
            numFunctionCalls++;
          })
        });

      outstream.on('data', function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
      });

      outstream.on('end', function() {
        numFunctionCalls.should.equal(1);
        done();
      });

      instream.pipe(outstream);
    });
  });
});
