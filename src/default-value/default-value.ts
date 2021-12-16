import { Rule } from 'eslint';
import { ObjectExpression } from 'estree';
import { findPropertyOnNode, isFunctionCallExpression } from '../util';

export const Errors = {
  twoArguments: 'Translate function should have two arguments',
  optionsObject: 'Translate function options should be an object',
  defaultValuePresence:
    'Translate function defaultValue must a string property on the second argument',
  missingVariable: (named: string) =>
    `Missing "${named}" in translate variables`,
  referenceInterpolation:
    'Detected an interpolated variable. Use a static string instead.',
};

const findDefaultValueOnObject = (node: ObjectExpression) => {
  const prop = findPropertyOnNode(node, { named: 'defaultValue' });

  if (prop?.value.type === 'Literal' && typeof prop.value.value === 'string') {
    const variableNames = prop.value.value
      .match(/{{[ a-zA-Z0-9]+}}/g)
      ?.map((value) => value.replace('{{', '').replace('}}', '').trim());

    return {
      value: prop.value.value,
      variableNames: variableNames ?? [],
    };
  }
};

export type DefaultValueOptions = {
  translateFunctionNames: string[];
  allowKeyOnly: boolean;
  nestingPrefix: string;
  allowNestingInterpolation: boolean;
};

const parseOptions = (context: Rule.RuleContext): DefaultValueOptions => {
  const DEFAULT: DefaultValueOptions = {
    translateFunctionNames: ['t'],
    allowKeyOnly: false,
    nestingPrefix: '$t(',
    allowNestingInterpolation: false,
  };

  if (!context.options.length) {
    return DEFAULT;
  }

  return {
    ...DEFAULT,
    ...context.options[0],
  };
};

export const defaultValueRule: Rule.RuleModule = {
  meta: {
    schema: [
      {
        type: 'object',
        additionalProperties: true,
        properties: {
          translateFunctionNames: {
            type: 'array',
            items: { type: 'string' },
          },
          allowKeyOnly: {
            type: 'boolean',
          },
          nestingPrefix: {
            type: 'string',
          },
          allowNestingInterpolation: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  create: (context) => {
    const options = parseOptions(context);

    return {
      CallExpression: (node) => {
        if (
          !isFunctionCallExpression(node, {
            named: options.translateFunctionNames,
          })
        ) {
          return;
        }

        // Detect key only scenario.
        if (node.arguments.length < 2) {
          if (options.allowKeyOnly && node.arguments.length === 1) {
            return;
          }
          context.report({
            node,
            message: Errors.twoArguments,
          });
          return;
        }

        const secondArg = node.arguments[1];

        // Enforce that second argument is an object.
        if (secondArg.type !== 'ObjectExpression') {
          context.report({
            node,
            message: Errors.optionsObject,
          });
          return;
        }

        // Enforce that second argument contains a defaultValue.
        const defaultValue = findDefaultValueOnObject(secondArg);
        if (!defaultValue) {
          context.report({
            node,
            message: Errors.defaultValuePresence,
          });
          return;
        }

        // Enforce that all referenced variables are provided.
        for (const variable of defaultValue.variableNames) {
          const prop = findPropertyOnNode(secondArg, { named: variable });
          if (!prop) {
            context.report({
              node,
              message: Errors.missingVariable(variable),
            });
          }
        }

        // Check for interpolated references.
        if (!options.allowNestingInterpolation) {
          const hasAnInterpolatedVariable = defaultValue.value.includes(
            options.nestingPrefix,
          );

          if (hasAnInterpolatedVariable) {
            context.report({
              node,
              message: Errors.referenceInterpolation,
            });
          }
        }
      },
    };
  },
};
