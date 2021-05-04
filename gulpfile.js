const {src, dest, parallel, series, watch} = require('gulp');
const browserSync  = require('browser-sync').create();
const sass         = require('gulp-sass');
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const cleancss     = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename       = require('gulp-rename');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const del          = require('del');

function browsersync()
{
    browserSync.init({
        server: {baseDir: 'app/'}, // Папка сервера
        notify: false,
        online: true
    })
}

function styles()
{
    return src('app/sass/*.sass')
    .pipe(sass())
    .pipe(concat('styles.min.css'))
    .pipe(autoprefixer({overrideBrowserslist: ['last 10 versions'], grid: true})) // Если в проекте еспользуется Grid css, то значение должно быть true
    .pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } ))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}

function images()
{
    return src('app/img/src/**/*')
    .pipe(newer('app/img/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/img/dest/'))
}

function delImg()
{
    return del('app/img/dest/**/*', {force: true})
}

function scripts()
{
    return src([
        //'node_modules/jquery/dist/jquery.min.js',
        'app/js/*.js',
        '!app/js/scripts.min.js'
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}

function buildcopy()
{
    return src([
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/img/dest/**/*',
        'app/**/*.html',
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function delDist()
{
    return del('dist/**/*', {force: true})
}

function startwatch()
{
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    watch('app/**/*.sass', styles);
    watch('app/**/*.html').on('change', browserSync.reload);
    watch('app/img/src/**/*', images);
}

exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.styles      = styles;
exports.images      = images;
exports.delImg      = delImg;
exports.delDist     = delDist;
exports.build       = series(delDist, styles, scripts, images, buildcopy);
exports.default     = parallel(styles, scripts, browsersync, startwatch);
