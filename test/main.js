/*global describe, it*/
"use strict";

var gulp = require('gulp'),
    should = require('should'),
    es = require('event-stream'),
    join = require('path').join,
    notify = require('../');

var mockGenerator = function (tester) {
  tester = tester || function () {  };
  return function (opts, callback) {
    tester(opts);
    callback();
  };
};

describe('gulp output stream', function() {
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

    it('should call notifier with title and message', function(done) {
      var testString = "this is a test",
          instream = gulp.src(join(__dirname, "./fixtures/*.txt")),
          outstream = notify({
            message: testString,
            notifier: mockGenerator(function (opts) {
              should.exist(opts);
              should.exist(opts.title);
              should.exist(opts.message);
              String(opts.message).should.equal(testString);
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

      instream.pipe(outstream)
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
        .pipe(es.through(function (file) {
          numFilesBefore++;
          this.emit("data", file);
        }, function () {
          numFilesBefore.should.equal(3);
          this.emit("end");
        }))
        .pipe(outstream)
        .pipe(es.through(function (file) {
          numFilesAfter++;
          this.emit("data", file);
        }, function () {
          numFilesAfter.should.equal(3);
          this.emit("end");
          done();
        }));
    });
  });
});
