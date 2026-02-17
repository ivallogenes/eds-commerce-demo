export default {
  plugins: {
    'postcss-import': {},
    'postcss-nesting': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
        'color-mix': true,
      },
      autoprefixer: {
        grid: true,
      },
    },
    autoprefixer: {
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'not dead',
        'not ie <= 11',
      ],
      // Reduce aggressive prefixing for modern features
      flexbox: 'no-2009',
      grid: 'autoplace',
    },
  },
};
