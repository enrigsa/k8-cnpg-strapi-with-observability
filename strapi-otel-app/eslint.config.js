const eslint = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');
const aliasResolver = require('eslint-import-resolver-alias');

module.exports = [
  {
    ignores: ['node_modules/**'],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['#_lib', './src/_lib'],
            ['#observability', './observability'],
            ['#services', './src/services'],
            ['#scripts', './src/scripts'],
          ],
          extensions: ['.js'],
        },
        node: {
          extensions: ['.js'],
        },
      },
      'import/resolvers': {
        alias: aliasResolver,
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'no-use-before-define': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['.strapi/client/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  prettierConfig,
];
