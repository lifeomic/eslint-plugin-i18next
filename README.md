This repository contains an ESLint plugin for validating usage of [`i18next`](https://github.com/i18next/i18next).

## Installation

```
yarn add -D @lifeomic/eslint-plugin-i18next
```

## Usage

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@lifeomic/i18next'],
  rules: {
    '@lifeomic/i18next/default-value': [
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
- `allowKeyOnly`: whether to allow e.g. `t('just-the-key')`. Default is `false`.
- `allowNestingInterpolation`: Whether to allow e.g. `{ defaultValue: 'some string $t(interpolated)' }`. Default is `false`.
- `nestingPrefix`: Used when `allowNestingInterpolation` is `false` to identify interpolated variables. Default is `"$t("`.
