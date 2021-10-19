import { CallExpression, ObjectExpression } from 'estree';

export const isFunctionCallExpression = (
  node: CallExpression,
  options: { named: string[] },
) => {
  return (
    (node.callee.type === 'MemberExpression' &&
      options.named.includes((node.callee.property as any).name)) ||
    (node.callee.type === 'Identifier' &&
      options.named.includes(node.callee.name))
  );
};

export const findPropertyOnNode = (
  { properties }: ObjectExpression,
  options: {
    named: string;
  },
) => {
  for (const prop of properties) {
    if (
      prop.type === 'Property' &&
      prop.key.type === 'Identifier' &&
      prop.key.name === options.named
    ) {
      return prop;
    }
  }
};
