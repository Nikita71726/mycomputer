const {src, dest, series, watch} = require('gulp');
const concat = require('gulp-concat');
const htmlMin = require('gulp-htmlmin');
const autoprefix = require('gulp-autoprefixer');
const cssclean = require('gulp-clean-css');
const image = require('gulp-image');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync =require('browser-sync').create();
const delite = require('del');
const prod = require('yargs').argv;
const gulpif = require('gulp-if');

const clear = () => {
	return delite(['dist'])
}

const copyFile = () => {
	return src('src/fonts/*.*')
	.on('data', function (file) {
		console.log(file);
	})
	.pipe(dest('dist/fonts'))
}

const styles = () => {
	return src('src/css/**/*.css')
	.pipe(gulpif(prod.prod, sourcemaps.init()))
	.pipe(concat('style.css'))
	.pipe(autoprefix({
		cascade: false
	}))
	.pipe(gulpif(prod.prod, cssclean({
		level: 2
	})))
	.pipe(sourcemaps.write())
	.pipe(dest('dist/css'))
	.pipe(browserSync.stream())
}

const htmlMinify = () => {
	return src('src/**/*.html')
	.pipe(htmlMin({
		collapseWhitespace: true
	}))
	.pipe(dest('dist'))
	.pipe(browserSync.stream())
}

const images = () => {
	return src(['src/img/**/*.jpeg',
				'src/img/**/*.png',
				'src/img/**/*.svg'
		])
	.pipe(image())
	.pipe(dest('dist/img'))
}

const scripts = () => {
	return src('src/js/**/*.js')
	.pipe(gulpif(prod.prod, sourcemaps.init()))
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(concat('index.js'))
	.pipe(uglify({
		toplevel: true
	}).on('error', notify.onError()))
	.pipe(sourcemaps.write())
	.pipe(dest('dist/js'))
	.pipe(browserSync.stream())
}

const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: 'dist'
		}
	})
}

watch('src/**/*.html', htmlMinify)
watch('src/css/**/*.css', styles)
watch('src/js/**/*.js', scripts)
watch('src/fonts', copyFile)

exports.clear = clear
exports.htmlMinify = htmlMinify
exports.default = series(clear, copyFile, styles, scripts, htmlMinify, images, watchFiles)