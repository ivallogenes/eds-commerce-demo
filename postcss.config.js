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
    'autoprefixer': {},
  },
};
