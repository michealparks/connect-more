'use strict';

var gulp = require('gulp');

// Javascript

var browserify = require('browserify');
var babel      = require('gulp-babel');
var babelify   = require('babelify');
var source     = require('vinyl-source-stream');

var concat = require('gulp-concat');
var addsrc = require('gulp-add-src');
var uglify = require('gulp-uglify');
var inline = require('gulp-inline');

// CSS
var stylus = require('gulp-stylus');
var nib    = require('nib');

// HTML
var jade = require('gulp-jade');

// Server
var webserver = require('gulp-webserver');

gulp.task('javascript', function (done) {
  browserify({
    paths: ['./app', './node-modules'],
    entries: './app/app.js',
    debug: true
  })
  .transform(babelify)
  .bundle()
  .pipe(source('build.js'))

  // .pipe(addsrc.prepend('lib/array.js'))
  // .pipe(addsrc.prepend('lib/react.min.js'))
  // .pipe(concat('build.js'))
  .pipe(gulp.dest('build'))

  return done();

  // gulp.src(['app/**/*.js'])
  //   .pipe(babel({modules: 'amd', moduleIds: true}))
  //   .on('error', function (e) {
  //     console.error(e.message);
  //     this.emit('end');
  //   })
  //   .pipe(addsrc.prepend('lib/array.js'))
  //   .pipe(addsrc.prepend('lib/almond.js'))
  //   .pipe(addsrc.prepend('lib/react.min.js'))
  //   .pipe(concat('app.js'))
  //   .pipe(gulp.dest('build'));
  // return done();
});

gulp.task('css', function (done) {
  gulp.src(['app/**/!(variables|mixins)*.styl'])
    .pipe(addsrc.prepend('app/styl/*(mixins|variables).styl'))
    .pipe(concat('app.styl'))
    .pipe(stylus({use: nib(), compress: true}))
    .pipe(gulp.dest('build'));
  return done();
});

gulp.task('jade', function () {
  gulp.src(['app/**/*.jade'])
    .pipe(jade({}))
    .pipe(gulp.dest('./'));
});

gulp.task('inline', ['javascript', 'css'], function () {
  gulp.src('index.html')
    .pipe(inline({
      base: './',
      js: uglify({reserved: 'require'}),
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('webserver', function () {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      host: '0.0.0.0',
      directoryListing: false,
      open: true,
      fallback: 'index.html'
    }));
});


var mainTasks = ['javascript', 'css', 'jade'];

gulp.task('watch', function () { gulp.watch(['./app/**'], [mainTasks]); });
gulp.task('build', mainTasks.concat(['inline']));
gulp.task('default', mainTasks.concat(['webserver', 'watch']));
