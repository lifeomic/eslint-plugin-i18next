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
};

const parseOptions = (context: Rule.RuleContext): DefaultValueOptions => {
  const DEFAULT: DefaultValueOptions = {
    translateFunctionNames: ['t'],
    allowKeyOnly: false,
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

        if (secondArg.type !== 'ObjectExpression') {
          context.report({
            node,
            message: Errors.optionsObject,
          });
          return;
        }

        const defaultValue = findDefaultValueOnObject(secondArg);
        if (!defaultValue) {
          context.report({
            node,
            message: Errors.defaultValuePresence,
          });
          return;
        }

        for (const variable of defaultValue.variableNames) {
          const prop = findPropertyOnNode(secondArg, { named: variable });
          if (!prop) {
            context.report({
              node,
              message: Errors.missingVariable(variable),
            });
            return;
          }
        }
      },
    };
  },
};
