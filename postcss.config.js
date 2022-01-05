module.exports = {
  map: false,
  plugins: [
    require('tailwindcss')(),
    require('postcss-inline-svg')({
      paths: ['.'],
    }),
    process.env.NODE_ENV === 'production' ? require('autoprefixer')() : null,
    process.env.NODE_ENV === 'production'
      ? require('cssnano')({
          preset: 'default',
        })
      : null,
    require('tailwindcss'),
  ],
};
