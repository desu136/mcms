const base = require('./base');

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // React library specifics
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
