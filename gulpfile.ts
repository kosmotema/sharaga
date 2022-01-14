import gulp from 'gulp';
import postcss from 'gulp-postcss';
import ts from 'gulp-typescript';
import nodemon from 'gulp-nodemon';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';

const tsProject = ts.createProject('tsconfig.json');
const bsInstance = browserSync.create();

const paths = {
  src: {
    style: 'style/main.css',
  },
  dest: {
    style: 'public/style/',
    code: 'dist',
  },
  watch: {
    style: 'style/*.scss',
    code: 'src',
    template: 'views/*.hbs',
    configs: ['tailwind.config.js', 'postcss.config.js'],
  },
  script: 'src/app.ts',
};

const developmentPort = 8000;

const tasks = {
  style: 'style',
  code: 'code',
  build: 'build',
  watch: 'watch',
};

gulp.task(tasks.style, () =>
  gulp
    .src(paths.src.style)
    .pipe(sourcemaps.init())
    .pipe(postcss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dest.style))
    .pipe(bsInstance.stream())
);

gulp.task(tasks.code, () =>
  tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(tsProject.options.outDir ?? paths.dest.code))
);

gulp.task(tasks.build, gulp.parallel(tasks.code, tasks.style));

gulp.task(
  tasks.watch,
  gulp.series(
    tasks.style,
    gulp.parallel(
      (done) => {
        nodemon({
          script: paths.script,
          watch: [paths.watch.code],
          env: { NODE_ENV: 'development', PORT: developmentPort },
          done,
        }).on('start', () => setTimeout(() => bsInstance.reload(), 5000));
      },
      (done) => {
        bsInstance.init({ proxy: `http://localhost:${developmentPort}` });
        gulp.watch(
          [...paths.watch.configs, paths.watch.style, paths.watch.template],
          gulp.task(tasks.style)
        );
        gulp.watch(paths.watch.template).on('change', bsInstance.reload);
        done();
      }
    )
  )
);

gulp.task('default', gulp.series('watch'));
