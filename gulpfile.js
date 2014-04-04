// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

// Styles
gulp.task('styles', function() {
  return gulp.src('src/scss/main.scss')
    .pipe(sass({ style: 'expanded', }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(livereload(server))
    .pipe(gulp.dest('css'));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/js/**/*.js')
    // .pipe(jshint('.jshintrc'))
    // .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(livereload(server))
    .pipe(gulp.dest('js'));
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images');
});

// Watch
gulp.task('watch', function() {

    // Watch .scss files
    gulp.watch('src/scss/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('src/js/**/*.js', ['scripts']);

});