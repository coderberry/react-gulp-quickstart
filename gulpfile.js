var createServers, execWebpack, httpPort, sassConfig, vendorPaths;

var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var express = require('express');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var watch = require('gulp-watch');
var rev = require('gulp-rev');
var tiny_lr = require('tiny-lr');
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");
var sourcemaps = require('gulp-sourcemaps');



/***************** Configs *****************/

if (gulp.env.production) {
  webpackConfig.plugins = webpackConfig.plugins.concat(new webpack.optimize.UglifyJsPlugin());
  webpackConfig.output.filename = "main-[hash].js";
}
sassConfig = { includePaths: ['src/styles'] };
httpPort = 4000;

// paths to files in bower_components that should be copied to dist/assets/vendor
vendorPaths = [
  'es5-shim/es5-sham.js',
  'es5-shim/es5-shim.js'
];



/***************** Tasks *****************/

gulp.task('clean', function() {
  return gulp.src('dist', { read: false })
             .pipe(clean());
});

// main.scss should @include any other CSS you want
gulp.task('sass', function() {
  return gulp.src('src/styles/main.scss')
             .pipe(gulp.env.production ? gutil.noop() : sourcemaps.init())
             .pipe(sass(sassConfig).on('error', gutil.log))
             .pipe(gulp.env.production ? gutil.noop() : sourcemaps.write())
             .pipe(gulp.env.production ? minifyCSS() : gutil.noop())
             .pipe(gulp.env.production ? rev() : gutil.noop())
             .pipe(gulp.dest('dist/assets'));
});

// Some JS and CSS files we want to grab from Bower and put them in a dist/assets/vendor directory
// For example, the es5-sham.js is loaded in the HTML only for IE via a conditional comment.
gulp.task('vendor', function() {
  var paths = vendorPaths.map(function(p) {
    return path.resolve("./bower_components", p);
  });
  return gulp.src(paths)
             .pipe(gulp.dest('dist/assets/vendor'));
});

// Just copy over remaining assets to dist. Exclude the styles and scripts as we process those elsewhere
gulp.task('copy', function() {
  return gulp.src(['src/**/*', '!src/scripts', '!src/scripts/**/*', '!src/styles', '!src/styles/**/*'])
             .pipe(gulp.dest('dist'));
});

// This task lets Webpack take care of all the coffeescript and JSX transformations, defined in webpack.config.js
// Webpack also does its own uglification if we are in --production mode
gulp.task('webpack', function(callback) {
  execWebpack(webpackConfig);
  return callback();
});

gulp.task('dev', ['build'], function() {
  var servers;
  servers = createServers(httpPort, 35729);

  // When /src changes, fire off a rebuild
  gulp.watch(['./src/**/*'], function(evt) {
    return gulp.run('build');
  });

  // When /dist changes, tell the browser to reload
  return gulp.watch(['./dist/**/*'], function(evt) {
    gutil.log(gutil.colors.cyan(evt.path), 'changed');
    return servers.lr.changed({
      body: {
        files: [evt.path]
      }
    });
  });
});

gulp.task('build', ['webpack', 'sass', 'copy', 'vendor'], function() {});

gulp.task('default', ['build'], function() {
  // Give first-time users a little help
  return setTimeout(function() {
    gutil.log("**********************************************");
    gutil.log("* gulp              (development build)");
    gutil.log("* gulp clean        (rm /dist)");
    gutil.log("* gulp --production (production build)");
    gutil.log("* gulp dev          (build and run dev server)");
    return gutil.log("**********************************************");
  }, 3000);
});



/***************** Helpers *****************/

// Create both http server and livereload server
createServers = function(port, lrport) {
  var app, lr;
  lr = tiny_lr();
  lr.listen(lrport, function() {
    return gutil.log("LiveReload listening on", lrport);
  });
  app = express();
  app.use(express["static"](path.resolve("./dist")));
  app.listen(port, function() {
    return gutil.log("HTTP server listening on", port);
  });
  return {
    lr: lr,
    app: app
  };
};

execWebpack = function(config) {
  return webpack(config, function(err, stats) {
    if (err) {
      throw new gutil.PluginError("execWebpack", err);
    }
    return gutil.log("[execWebpack]", stats.toString({
      colors: true
    }));
  });
};
