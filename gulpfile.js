const gulp          = require('gulp'),
      sass          = require('gulp-sass'),
      concat         = require('gulp-concat'),
      uglify         = require('gulp-uglify-es').default,
      imagemin       = require('gulp-imagemin'),
      cache          = require('gulp-cache'),
      rename        = require("gulp-rename"),
      autoprefixer  = require('gulp-autoprefixer'),
      csso          = require('gulp-csso'),
      cleancss      = require('gulp-clean-css'),
      del           = require('del'),
      notify         = require("gulp-notify"),
      browserSync   = require('browser-sync').create();


function server () {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
        notify: false,
        // tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
    });
}


function scripts () {
    return gulp.src([
      'app/libs/jquery/dist/jquery.min.js',
      './app/js/main.js'
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({ stream: true }))
}

function styles () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({outputStyle: 'expanded'}).on("error", notify.onError()))
        .pipe(rename({ suffix: '.min', prefix : '' }))
        .pipe(autoprefixer({
            grid: true,
            overrideBrowserslist: ['last 10 versions']
        }))
        .pipe(csso())
        .pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({ stream: true }))
}

function img () {
    return gulp.src('app/img/**/*')
        .pipe(cache(imagemin())) // Cache Images
        .pipe(gulp.dest('dist/img'));
}

function code () {
    return gulp.src('app/**/*.html')
        .pipe(browserSync.reload({ stream: true }))
}

function clean () {
    return del('./dist');
}

function clearcache () { return cache.clearAll(); }

function watch () {
    gulp.watch('app/scss/**/*.scss', styles);
    gulp.watch(['libs/**/*.js', 'app/js/main.js'], scripts);
    gulp.watch('app/*.html', code);
}

gulp.task('build',function (done) {
    let buildFiles = gulp.src([
        'app/*.html',
        'app/*.php'
    ]).pipe(gulp.dest('dist'));

    let buildCss = gulp.src([
        'app/css/**/*.css'
    ]).pipe(gulp.dest('dist/css'));

    let buildJs = gulp.src('app/js/**/*.min.js')
        .pipe(gulp.dest('dist/js'));

    let buildFonts = gulp.src([
        'app/fonts/**/*'
    ]).pipe(gulp.dest('dist/fonts'));
    done();
});

exports.code = code;
exports.styles = styles;
exports.scripts = scripts;
exports.clean = clean;
exports.clearcache = clearcache;
exports.img = img;

gulp.task('default', gulp.series(
    clean, clearcache, img,
    gulp.parallel(styles, code, scripts),
    gulp.parallel(watch, server)
));