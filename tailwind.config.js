module.exports = {
  content: ['./views/**/*.hbs'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '10rem',
      },
    },
    extend: {
      invert: {
        25: '.25',
        50: '.5',
        75: '.75',
      },
      backgroundImage: {
        'image-main': "url('/static/images/space.webp')",
        'image-education': "svg-load('icons/education.svg')",
        'image-menu': "svg-load('icons/menu.svg')",
        'image-cross': "svg-load('icons/cross.svg')",
      },
    },
  },
  plugins: [],
};
