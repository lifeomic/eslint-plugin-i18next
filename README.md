This repository contains an ESLint plugin for validating usage of [`18next`](https://github.com/i18next/i18next).

## Installation

```
yarn add -D @lifeomic/eslint-plugin-18next
```

## Usage

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@lifeomic/i18next'],
  rules: {
    'i18next/default-value': [
      'error',
      {
        /* optional options object */
      },
    ],
  },
};
```

## Rule Options

#### `default-value`

- `translateFunctionNames`: an array of translation function names to validate. Default is `['t']`
- `allowKeyOnly`: whether to allow e.g. `t('just-the-key')`
