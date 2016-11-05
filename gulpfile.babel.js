/************ DEPENDENCIES ************/

import gulp from 'gulp';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import eslint from 'gulp-eslint';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import cssnano from 'gulp-cssnano';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import sync from 'browser-sync';
import deploy from 'gulp-gh-pages';
//import path from 'gulp-path'; // do this shit later
import _ from 'lodash';

/************ Options ************/

const browserifyOpts = {
	debug: true
};
const watchifyOpts = _.extend(
	browserifyOpts, watchify.args
);
const eslintOpts = {
	extends : 'eslint:recommended',
	//extends : 'airbnb',
	parser : 'babel-eslint',
  	rules : {
		'indent': [2, 'tab']
	}
}
const sassOpts = {
	includePaths: ["./node_modules/typey/stylesheets"] // include typey
}
const autoprefixerOpts = {
	browsers: ['last 2 versions'],
	add: true
}
const cssnanoOpts = {
	autoprefixer: autoprefixerOpts
}
const imageminOpts = {
	progressive: true,
	multipass: true,
	interlaced: true,
	optimizationLevel : 3
};
const syncOpts = {
  stream: true,
};
const deployOpts = {
	//branch: 'master', // user page website
};

/************ HELPER VARIABLES AND FUNCTIONS ************/

// Location constants
const SRC_HTML = './dist/**/*.html';
const SRC_SASS = './src/sass/**/*.scss';
const SRC_JS = './src/js/**/*.js';
const SRC_IMG	= './src/img/*';

const DEST_JS	= './dist/assets/js/';
const DEST_CSS = './dist/assets/css/';
const DEST_IMG = './dist/assets/img/';

const DIST_CSS = './dist/assets/css/*.css';
const DIST_JS = './dist/assets/js/*.js';

const ENTRY_JS = './src/js/app.js';

// Browserify function
let bundler;
function getBundler(watch) {
  if (!bundler) { // Initialize bundle with conditional 'watch'
		if (watch) {
    		bundler = watchify(browserify(ENTRY_JS, watchifyOpts));
		} else {
    		bundler = browserify(ENTRY_JS, browserifyOpts);
		}
  }
  return bundler;
};

/************ TASKS ************/

/**
 *	Compile SASS to CSS
 */
gulp.task('styles', () => {
	return gulp.src(SRC_SASS)
		.pipe(sourcemaps.init())
		.pipe(sass(sassOpts).on('error', sass.logError))
		.pipe(autoprefixer(autoprefixerOpts))
		.pipe(sourcemaps.write())
    .pipe(gulp.dest(DEST_CSS))
		.pipe(sync.reload(syncOpts));
});

/**
 *	Minify CSS
 */
gulp.task('min-styles', ['styles'], () => {
	return gulp.src(DIST_CSS)
		.pipe(cssnano(cssnanoOpts))
    .pipe(gulp.dest(DEST_CSS));
});

/**
 *	Builds JS persistently when needed
 */
gulp.task('scripts-watch', () => {
  return getBundler( true ) // Watchify
    .transform(babelify) // Babelify options in package.json
		.bundle().on('error', (err) => console.log('Error: ' + err.message))
    .pipe(source('app.js'))	// Output name
    .pipe(gulp.dest(DEST_JS))
    .pipe(sync.reload(syncOpts));
});

/**
 *	Builds JS once
 */
gulp.task('scripts', () => {
  return getBundler( false ) // Not watchifying
    .transform(babelify) // Babelify options in package.json
		.bundle().on('error', (err) => console.log('Error: ' + err.message))
    .pipe(source('app.js'))	// Output name
    .pipe(gulp.dest(DEST_JS));
});

/**
 *	Minify JS
 */
gulp.task('min-scripts', ['scripts'], () => {
	return gulp.src(DIST_JS)
		.pipe(uglify())
    .pipe(gulp.dest(DEST_JS));
});

/**
 *	Lint JS
 */
gulp.task('lint-scripts', () => {
  gulp.src(SRC_JS)
    .pipe(eslint(eslintOpts))
    .pipe(eslint.format());
});

/**
 *	Compress and move images
 */
gulp.task('min-img', () => {
	gulp.src(SRC_IMG)
		.pipe(imagemin(imageminOpts))
		.pipe(gulp.dest(DEST_IMG));
});

/**
 *	Auto build and reload
 */
gulp.task('dev', ['styles','scripts-watch'], () => {
  sync({
    server: {
      baseDir: './dist/'
    }
  });

	// Reloads on HTML, CSS, and JS changes
	gulp.watch(SRC_SASS, ['styles']);
	gulp.watch(SRC_HTML).on('change', sync.reload);
  getBundler().on('update', () => gulp.start('scripts-watch'));
});

/**
 *	Dist build
 */
gulp.task('dist', ['min-img','min-styles','lint-scripts','min-scripts'], () => {
  sync({
    server: {
      baseDir: './dist/'
    }
  });
});

/**
 *	Deploy to github pages
 */
gulp.task('deploy', ['min-img','min-styles','lint-scripts','min-scripts'], () => {
	return gulp.src('./dist/**/*')
		.pipe(deploy(deployOpts));
});
