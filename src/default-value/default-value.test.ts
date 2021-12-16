import { RuleTester } from 'eslint';
import { defaultValueRule, Errors } from './default-value';

const tester = new RuleTester();

tester.run('default-value', defaultValueRule, {
  valid: [
    {
      code: `
        t('key', { defaultValue: 'some long value' })
      `,
    },
    {
      code: `
        i18n.t('key', { defaultValue: 'some long value' })
      `,
    },
    {
      code: `
        translate('key', { defaultValue: 'some long value' })
      `,
      options: [{ translateFunctionNames: ['translate'] }],
    },
    {
      code: `
        translate('key', { defaultValue: 'some {{long}} value' })
      `,
      options: [{ translateFunctionNames: ['notTranslate'] }],
    },
    {
      code: `
        t('key', {
          defaultValue: 'some {{long}} value',
          long: 'something'
        })
      `,
    },
    {
      code: `
        t('key')
      `,
      options: [{ allowKeyOnly: true }],
    },
    {
      code: `
        someOtherFunction()
      `,
    },
    {
      code: `
        t('key', {
          defaultValue: 'some interpolated $t(var)'
        })
      `,
      options: [{ allowNestingInterpolation: true }],
    },
    {
      code: `
        t('key', {
          defaultValue: 'some interpolated $nest(var)'
        })
      `,
      options: [
        {
          allowNestingInterpolation: true,
          nestingPrefix: '$nest(',
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
        t('key')
      `,
      errors: [Errors.twoArguments],
    },
    {
      code: `
        t('key', 'bogus')
      `,
      errors: [Errors.optionsObject],
    },
    {
      code: `
        t('key', { notDefaultValue: 'something' })
      `,
      errors: [Errors.defaultValuePresence],
    },
    {
      code: `
        t('key', { defaultValue: true })
      `,
      errors: [Errors.defaultValuePresence],
    },
    {
      code: `
        t('key', { defaultValue: 'some {{long}} value' })
      `,
      errors: [Errors.missingVariable('long')],
    },
    {
      code: `
        translate('key', {
          defaultValue: 'some {{long }} value'
        })
      `,
      options: [{ translateFunctionNames: ['translate'] }],
      errors: [Errors.missingVariable('long')],
    },
    {
      code: `
        translate('key', {
          defaultValue: 'some {{long}} value'
        });

        t('key', {
          defaultValue: 'some {{short}} value'
        })
      `,
      options: [{ translateFunctionNames: ['translate', 't'] }],
      errors: [Errors.missingVariable('long'), Errors.missingVariable('short')],
    },
    {
      code: `
        t('key', {
          defaultValue: 'some interpolated $t(var)'
        })
      `,
      errors: [Errors.referenceInterpolation],
    },
    {
      code: `
        t('key', {
          defaultValue: 'some interpolated $nest(var)'
        })
      `,
      options: [
        {
          nestingPrefix: '$nest(',
        },
      ],
      errors: [Errors.referenceInterpolation],
    },
  ],
});
