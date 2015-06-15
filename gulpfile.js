var gulp = require('gulp');
  concat = require('gulp-concat'),
  htmlMin = require('gulp-htmlmin'),
  html2js = require('gulp-ng-html2js'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  minifyCss = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  karma = require('karma').server,
  jsdoc = require('gulp-jsdoc'),
  paths = {
    sass: ['./scss/**/*.scss']
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
  // TODO: Figure out way to do on('error') with this
  gulp.watch('./test/**/*.js', ['test']);
});

gulp.task('jsdoc', function() {
  gulp.src('./www/js/**/*.js')
    .pipe(jsdoc('./doc'));
});


// Build tasks
gulp.task('build:html', function() {
  gulp.src('./www/templates/**/*.html')
    .pipe(htmlMin({collapseWhitespace: true}))
    .pipe(html2js({
      moduleName: 'weatherHistory',
      prefix: 'template/'
    }))
    .pipe(concat('templates.min.js'))
    .pipe(gulp.dest('./www/dist/build/'));
});

gulp.task('build:js', ['build:html'], function() {
  gulp.src([
    './www/lib/ionic/js/ionic.bundle.js',
    './www/lib/ngCordova/dist/ng-cordova.js',
    './www/lib/moment/moment.js',
    './www/js/app.js',
    './www/js/services/services.js',
    './www/js/controllers/controllers.js',
    './www/js/directives/directives.js',
    './www/js/**/*.js',
    './www/dist/build/templates.min.js'
    ])
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
