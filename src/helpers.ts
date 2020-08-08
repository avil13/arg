import { IArgParamItem, DefaultValue } from '.';

export type TArgs = string[];
export type TAliasLists = string[][];

export const addAlias = (aliases: TAliasLists, ...items: string[]) => {
  if (items.length < 2) {
    return;
  }

  const [nameOne, ...leftNames] = items;

  const findList = aliases.find((list) => list.includes(nameOne));

  if (findList) {
    leftNames.forEach((v) => {
      if (findList.includes(v)) {
        return;
      }
      findList.push(v);
    });
    return;
  }

  const names = items.map((v) => v.trim());

  aliases.push(names);
};

export const hasKeyInArgs = (args: TArgs, name: string) => {
  return args.includes(`-${name}`) || args.includes(`--${name}`);
};

export const getExistsAliasParamName = (
  args: TArgs,
  aliases: TAliasLists,
  name: string
): string | undefined => {
  if (hasKeyInArgs(args, name)) {
    return name;
  }

  const [aliasesList] = aliases.filter((arr) => arr.includes(name));

  if (!aliasesList) {
    return;
  }

  return aliasesList.find((item) => hasKeyInArgs(args, item));
};

export const getArgumentsByKey = (
  args: TArgs,
  aliases: TAliasLists,
  name: string,
  isFlag = false
): string[] => {
  let isStarted = false;
  let isLast = false;

  if (!isFlag) {
    name = getExistsAliasParamName(args, aliases, name) || name;
  }

  const argsList = args.filter((str) => {
    if (isLast) {
      return false;
    }

    if (isStarted) {
      if (/^-{1,2}[^-]/.test(str)) {
        isLast = true;
        return false;
      }

      return true;
    }

    if ((isFlag && str === name) || str === `-${name}` || str === `--${name}`) {
      isStarted = true;
      return false;
    }
  });

  return argsList;
};

export const convertToType = (
  type: IArgParamItem['type'],
  value: DefaultValue | DefaultValue[]
) => {
  if (type === 'array') {
    return Array.isArray(value) ? value : [value];
  }

  value = Array.isArray(value) ? value.join(' ') : String(value);

  switch (type) {
    case 'boolean':
      if (value === '') {
        // "scritpt.js --ls"
        return true;
      }

      if (['true', 'false'].includes(value.toLowerCase())) {
        return value.toLowerCase() === 'true';
      }
      return Boolean(value);
    case 'number':
      const res = Number(value);
      return isNaN(res) ? 0 : res;
    case 'string':
    default:
      return value;
  }
};
