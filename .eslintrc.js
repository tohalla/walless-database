module.exports = {
  extends: [
    'google'
  ],
  globals: {
    Promise: true
  },
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  },
  rules: {
    'comma-dangle': [2, 'never'],
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-undef': 2,
    'no-nested-ternary': 0,
    'operator-linebreak': 0,
    "max-len": 1
  }
};
