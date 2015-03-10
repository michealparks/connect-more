'use strict';

var gulp = require('gulp');

// Javascript
var babel   = require('gulp-babel');
var concat  = require('gulp-concat');
var addsrc  = require('gulp-add-src');
var uglify  = require('gulp-uglify');

// CSS
var stylus = require('gulp-stylus');
var nib    = require('nib');

// HTML
var jade = require('gulp-jade');

// Server
var webserver = require('gulp-webserver');

gulp.task('javascript', function () {
  gulp.src(['app/**/*.js'])
    .pipe(babel({modules: 'amd', moduleIds: true}))
      .on('error', function (e) {
        console.error(e.message);
        this.emit('end');
      })
    .pipe(addsrc.prepend('lib/almond.js'))
    .pipe(addsrc.prepend('lib/react-with-addons.js'))
    .pipe(addsrc.prepend('lib/polyfill.js'))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('build'));
});

gulp.task('css', function () {
  gulp.src(['app/**/!(variables)*.styl'])
    .pipe(concat('app.styl'))
    .pipe(addsrc.prepend('app/styl/variables.styl'))
    .pipe(stylus({use: nib(), compress: true}))
    .pipe(gulp.dest('build'));
});

gulp.task('jade', function () {
  gulp.src(['app/**/*.jade'])
    .pipe(jade({}))
    .pipe(gulp.dest('build'));
});

gulp.task('uglify', function () {
  gulp.src(['build/app.js'])
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

gulp.task('webserver', function () {
  gulp.src('build')
    .pipe(webserver({
      livereload: true,
      host: '0.0.0.0',
      directoryListing: false,
      open: true,
      fallback: 'index.html'
    }));
});

var mainTasks = ['javascript', 'css', 'jade'];

gulp.task('watch', function () { gulp.watch('app/**', mainTasks); });
gulp.task('build', mainTasks.concat(['uglify']));
gulp.task('default', mainTasks.concat(['webserver', 'watch']));
