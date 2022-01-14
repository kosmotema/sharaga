module.exports = {
  plugins: [
    require('tailwindcss')(),
    require('postcss-inline-svg')({
      paths: ['.'],
    }),
    require('autoprefixer')(),
    process.env.NODE_ENV === 'production'
      ? require('cssnano')({
          preset: 'default',
        })
      : null,
    require('tailwindcss'),
  ],
};
