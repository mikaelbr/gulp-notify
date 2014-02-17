# gulp-notify [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> notification plugin for [gulp](https://github.com/gulpjs/gulp)

## Information
| Package       | gulp-notify  |
| ------------- |--------------|
| Description   | Send messages to Mac Notification Center or Linux notifications (using `notify-send`) using the [node-notifier](https://github.com/mikaelbr/node-notifier) module. Can also [specify custom notifier](#notifywithreporterfunction) (e.g. Growl notification). |
| Node Version  | >= 0.8      |

**Note: Without overriding the notifier, Mac OS X >= 10.8 or as of v0.3.2, Linux with `notify-send` installed is required for this to run.**

## Usage

First, install `gulp-notify` as a development dependency:

```shell
npm install --save-dev gulp-notify
```

Then, add it to your `gulpfile.js`:

```javascript

var notify = require("gulp-notify");
gulp.src("./src/test.ext")
  .pipe(notify("Hello Gulp!"));
```

Or with template


```javascript

var notify = require("gulp-notify");
gulp.src("./src/test.ext")
  .pipe(notify("Found file: <%= file.relative %>!"));
```

See [examples](examples/gulpfile.js) for more og the API section for various inputs.

## Notes/tip

`gulp-notify` passes on the `vinyl files` even on error. So if you are
using [`gulp-plumber`](https://github.com/floatdrop/gulp-plumber) the run
will not break if the notifier returns an error.

If you want to notify on errors [`gulp-plumber`](https://github.com/floatdrop/gulp-plumber)
can be used to not break the run and force you to have to restart gulp.

## API

### notify(String)

A message to notify per data on stream.
The string can be a lodash template as
it is passed through [gulp-util.template](https://github.com/gulpjs/gulp-util#templatestring-data).

### notify(Function)
Type: `function(VinylFile)`  

The result of the function is used as message.
Vinyl File from gulp stream passed in as argument.

The returned string can be a lodash template as 
it is passed through [gulp-util.template](https://github.com/gulpjs/gulp-util#templatestring-data).

### notify(options)

#### options.onLast
Type: `Boolean`  
Default: `false`

If the notification should only happen on the last file 
of the stream. Per default a notification is triggered
on each file.


#### options.message
Type: `String`  
Default: File path in stream

The message you wish to attach to file. The string can be a
lodash template as it is passed through [gulp-util.template](https://github.com/gulpjs/gulp-util#templatestring-data).

Example: `Created <%= file.relative %>`.

##### as function
Type: `Function(vinylFile)`  

See `notify(Function)`.

#### options.title
Type: `String`  
Default: "Gulp Notification"

The title of the notification. The string can be a
lodash template as it is passed through [gulp-util.template](https://github.com/gulpjs/gulp-util#templatestring-data).

Example: `Created <%= file.relative %>`.

##### as function
Type: `Function(vinylFile)`  

See `notify(Function)`.

#### options.templateOptions
Type: `Object`  
Default: {}

Object passed to the `lodash` template, for additional properties passed to the template.

Examples:

```javascript
gulp.src("../test/fixtures/*")
    .pipe(notify({
      message: "Generated file: <%= file.relative %> @ <%= options.date %>",
      templateOptions: {
        date: new Date()
      }
    }))
```

#### options.notifier
Type: `Function(options, callback)`  
Default: node-notifier module

Swap out the notifier by passing in an function. 
The function expects two arguments: options and callback.

The callback must be called when the notification is finished. Options
will contain both title and message.

*See `notify.withReporter` for syntactic sugar.*


### notify.withReporter(Function)
Type: `Reporter`

Wraps `options.notifier` to return a new notify-function only using
the passed in reporter.

Example:

```javascript
var custom = notify.withReporter(function (options, callback) {
  console.log("Title:", options.title);
  console.log("Message:", options.message);
  callback();
});

gulp.src("../test/fixtures/1.txt")
    .pipe(custom("This is a message."));

```

This will be the same as

```javascript

gulp.src("../test/fixtures/1.txt")
    .pipe(notify({
      message: "This is a message."
      notifier: function (options, callback) {
        console.log("Title:", options.title);
        console.log("Message:", options.message);
        callback();
      }
    }));
```

But much, much prettier.


### notify.onError()

The exact same API as using `notify()`, but where a `vinyl File`
is passed, the error object is passed instead.

Example:

```javascript
gulp.src("../test/fixtures/*")
      .pipe(through(function () {
        this.emit("error", new Error("Something happend: Error message!"))
      }))
      .on("error", notify.onError(function (error) {
        return "Message to the notifier: " + error.message;
      }));
```

Or simply:

```javascript
gulp.src("../test/fixtures/*")
      .pipe(through(function () {
        this.emit("error", new Error("Something happend: Error message!"))
      }))
      .on("error", notify.onError("Error: <%= error.message %>"));
```

```javascript
gulp.src("../test/fixtures/*")
      .pipe(through(function () {
        this.emit("error", new Error("Something happend: Error message!"))
      }))
      .on("error", notify.onError({
        message: "Error: <%= error.message %>",
        title: "Error running something"
      }));
```

The `onError()` end point does not support `lodash.template`.

### notify.setLogLevel(level)
Type: `Integer`  
Default: `2`

Set if logger should be used or not. If log level is set to 0,
no logging will be used.

* `0`: No logging
* `1`: Log on error
* `2`: Log both on error and regular notification.


If logging is set to `> 0`, the title and
message passed to `gulp-notify` will be logged like so:

```sh
➜  gulp-notify git:(master) ✗ gulp --gulpfile examples/gulpfile.js one
[gulp] Using file /Users/example/gulp-notify/examples/gulpfile.js
[gulp] Working directory changed to /Users/example/repos/gulp-notify/examples
[gulp] Running 'one'...
[gulp] Finished 'one' in 4.08 ms
[gulp] gulp-notify: [Gulp notification] /Users/example/gulp-notify/test/fixtures/1.txt
```

## Examples

To see all examples run from root:

```shell
$ gulp --gulpfile examples/gulpfile.js --tasks
[gulp] Using file /Users/example/gulp-notify/examples/gulpfile.js
[gulp] Working directory changed to /Users/example/gulp-notify/examples
[gulp] Tasks for /Users/example/gulp-notify/examples/gulpfile.js
[gulp] ├── multiple
[gulp] ├── one
[gulp] ├── customReporter
[gulp] ├── message
[gulp] ├── function
[gulp] ├── onlast
[gulp] └── error
```

To run an example:
```shell
$ gulp --gulpfile examples/gulpfile.js multiple
[gulp] Using file /Users/example/gulp-notify/examples/gulpfile.js
[gulp] Working directory changed to /Users/example/gulp-notify/examples
[gulp] Running 'multiple'...
[gulp] Finished 'multiple' in 3.75 ms
```

## Changelog

### `v0.6.2`
1. Adds another logging level: 0 - none, 1 - error, 2 - all.

### `v0.6.1`
1. Added `.onError` method on object created by `withReporter`
2. Added colored logging on success / error

### `v0.5.0`
1. Added API end point `notify.withReporter(Reporter)` as syntactic suger for custom reporter
2. Updated dependency for node-notfier - now checking if `notify-send` is installed on the Linux box


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-notify
[npm-image]: https://badge.fury.io/js/gulp-notify.png

[travis-url]: http://travis-ci.org/mikaelbr/gulp-notify
[travis-image]: https://secure.travis-ci.org/mikaelbr/gulp-notify.png?branch=master

[depstat-url]: https://david-dm.org/mikaelbr/gulp-notify
[depstat-image]: https://david-dm.org/mikaelbr/gulp-notify.png
