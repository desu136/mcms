const base = require('./base');

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...base,
  {
    files: ['**/*.ts'],
    rules: {
      // NestJS uses decorator patterns that require some relaxed rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
];
