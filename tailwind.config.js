const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./views/**/*.hbs'],
  theme: {
    screens: {
      xs: '480px',
    },
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
        'image-main': 'url("/static/images/space.webp")',
        'image-education': 'svg-load("icons/school_black_24dp.svg")',
        'image-menu': 'svg-load("icons/menu_black_24dp.svg")',
        'image-cross': 'svg-load("icons/close_black_24dp.svg")',
        'image-back': 'svg-load("icons/arrow_back_black_24dp.svg")',
        'image-home': 'svg-load("icons/home_black_24dp.svg")',
        'image-chevron-right': 'svg-load("icons/chevron_right_black_24dp.svg")',
      },
    },
  },
  plugins: [],
};
