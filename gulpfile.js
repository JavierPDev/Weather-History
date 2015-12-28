var gulp = require('gulp');
var concat = require('gulp-concat');
var htmlMin = require('gulp-htmlmin');
var html2js = require('gulp-ng-html2js');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var karma = require('karma').server;
var jsdoc = require('gulp-jsdoc');
var browserSync = require('browser-sync').create();
var paths = {
    sass: ['./scss/**/*.scss'],
    templates: ['./www/templates/**/*.html'],
    js: [
      './www/lib/ionic/js/ionic.bundle.js',
      './www/lib/ngCordova/dist/ng-cordova.js',
      './www/lib/moment/moment.js',
      './www/js/app.js',
      './www/js/services/services.js',
      './www/js/controllers/controllers.js',
      './www/js/directives/directives.js',
      './www/js/**/*.js',
      './www/dist/build/templates.min.js'
    ]
  };

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('sassd', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('test', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('testd', function() {
  gulp.watch('./test/**/*.js', ['test']);
});

gulp.task('jsdoc', function() {
  gulp.src('./www/js/**/*.js')
    .pipe(jsdoc('./doc'));
});


// Build tasks
gulp.task('build:html', function() {
  gulp.src(paths.templates)
    .pipe(htmlMin({collapseWhitespace: true}))
    .pipe(html2js({
      moduleName: 'weatherHistory',
      prefix: 'template/'
    }))
    .pipe(concat('templates.min.js'))
    .pipe(gulp.dest('./www/dist/build/'));
});

gulp.task('build:js', ['build:html'], function() {
  gulp.src(paths.js)
    .pipe(ngAnnotate())
    .pipe(sourcemaps.init())
      .pipe(concat('main.min.js'))
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./www/dist/'));
});

gulp.task('build', ['build:js']);

gulp.task('buildd', function() {
  gulp.watch([
    './www/templates/**/*.html',
    './www/js/**/*.js'
  ], ['build']);
});

gulp.task('serve', function() {
  browserSync.init({
    proxy: 'localhost:8100',
    port: 8200,
    open: false
  });

  gulp.watch("./www/js/**/*.js").on('change', browserSync.reload);
  gulp.watch("./scss/*.scss", ['sass']);
  gulp.watch("./www/templates/**/*.html").on('change', browserSync.reload);
  gulp.watch("./www/css/*.css").on('change', browserSync.reload);
});
