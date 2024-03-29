const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./views/**/*.hbs'],
  theme: {
    screens: {
      xs: '480px',
      ...defaultTheme.screens,
    },
    container: {
      center: true,

      screens: {
        xs: '100%',
        ...defaultTheme.screens,
      },

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
        'image-main-dark': 'url("/static/images/space.webp")',
        'image-main-light': 'url("/static/images/space-inverted.webp")',
        'image-education': 'svg-load("icons/school_black_24dp.svg")',
        'image-menu': 'svg-load("icons/menu_black_24dp.svg")',
        'image-cross': 'svg-load("icons/close_black_24dp.svg")',
        'image-back': 'svg-load("icons/arrow_back_black_24dp.svg")',
        'image-home': 'svg-load("icons/home_black_24dp.svg")',
        'image-chevron-right': 'svg-load("icons/chevron_right_black_24dp.svg")',
        'image-date': 'svg-load("icons/date_range_black_24dp.svg")',
        'image-size': 'svg-load("icons/straighten_black_24dp.svg")',
        'image-dissatisfied': 'svg-load("icons/sentiment_very_dissatisfied_black_48dp.svg")',
        'image-neutral': 'svg-load("icons/sentiment_neutral_black_48dp.svg")',
      },
    },
  },
  plugins: [],
};
