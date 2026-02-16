module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'import/prefer-default-export': 'off', // allow named exports for single exports
    'import/no-cycle': 'off', // allow circular dependencies for browser code
    'import/no-relative-packages': 'off', // allow relative imports for browser code
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'no-use-before-define': [2, { functions: false }],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'info', 'debug'],
      },
    ],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-underscore-dangle': 'off', // allow all underscore properties
    'object-curly-newline': 'off', // disable object curly newline requirements
    'arrow-parens': ['error', 'as-needed'], // require parens only when necessary
  },
  overrides: [
    {
      files: ['build.mjs'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: ['scripts/**/*.js', 'postinstall.js', '**/*.config.js', '**/*.config.mjs'],
      rules: {
        'import/no-extraneous-dependencies': 'off', // Allow dev dependencies in build scripts
        'no-console': 'off', // Allow console output in build scripts
        'no-restricted-syntax': 'off', // Allow for...of loops in build scripts
        'no-await-in-loop': 'off', // Allow await in loops for sequential processing
        'no-continue': 'off', // Allow continue statements in build scripts
      },
    },
  ],
};
