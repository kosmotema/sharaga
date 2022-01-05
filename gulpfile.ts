import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import ts from 'gulp-typescript';
import nodemon from 'gulp-nodemon';
import browserSync from 'browser-sync';
// import sourcemaps from 'gulp-sourcemaps';

const sass = gulpSass(dartSass);
const tsProject = ts.createProject('tsconfig.json');
const bsInstance = browserSync.create();

gulp.task('scss', () =>
  gulp
    .src('style/main.scss')
    // .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss())
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/style/'))
    .pipe(bsInstance.stream())
);

gulp.task('ts', () =>
  tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(tsProject.options.outDir ?? 'dist'))
);

gulp.task('build', gulp.parallel('ts', 'scss'));

gulp.task(
  'watch',
  gulp.series('scss', (done) => {
    bsInstance.init({ proxy: 'localhost:8000' });
    gulp.watch(['style/*.scss', 'views/*.hbs'], gulp.task('scss'));
    gulp.watch('views/*.hbs').on('change', bsInstance.reload);
    nodemon({
      script: 'src/app.ts',
      watch: ['src'],
      env: { NODE_ENV: 'development', PORT: 8000 },
      done,
    });
  })
);

gulp.task('default', gulp.series('watch'));
