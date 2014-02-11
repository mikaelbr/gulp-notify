# gulp-notify [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> notification plugin for [gulp](https://github.com/gulpjs/gulp)

## Information
| Package       | gulp-notify  |
| ------------- |--------------|
| Description   | Send messages to Mac Notification Center or Linux notifications (using `notify-send`) using the [node-notifier](https://github.com/mikaelbr/node-notifier) module. Can also specify custom notifier (e.g. Growl notification). |
| Node Version  | >= 0.8      |

**Note: Without overriding the notifier, Mac OS X >= 10.8 or as of v0.3.2, Linux with `notify-send` installaed is required for this to run.**

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

## Examples

To see all examples run from root:

```shell
$ gulp --gulpfile examples/gulpfile.js --tasks
[gulp] Using file /Users/example/gulp-notify/examples/gulpfile.js
[gulp] Working directory changed to /Users/example/gulp-notify/examples
[gulp] Tasks for /Users/example/gulp-notify/examples/gulpfile.js
[gulp] ├── multiple
[gulp] ├── one
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


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-notify
[npm-image]: https://badge.fury.io/js/gulp-notify.png

[travis-url]: http://travis-ci.org/mikaelbr/gulp-notify
[travis-image]: https://secure.travis-ci.org/mikaelbr/gulp-notify.png?branch=master

[depstat-url]: https://david-dm.org/mikaelbr/gulp-notify
[depstat-image]: https://david-dm.org/mikaelbr/gulp-notify.png
