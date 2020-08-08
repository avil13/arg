//#region [ interfaces ]

import {
  addAlias,
  getArgumentsByKey,
  convertToType,
} from './helpers';

export interface IArgOptions {
  isTest?: boolean;
}

export type DefaultValue = null | string | number | boolean;

export interface IArgParamList {
  [key: string]: IArgParamItem;
}

export interface IArgParamItem {
  type: 'string' | 'number' | 'array' | 'boolean';
  default?: string | number | boolean | string[];
  description?: string;
  alias?: string;
  required?: boolean;
  flag?: boolean;
}

interface IArg {
  val: {
    (key: string): any;
    str(key: string): string;
    num(key: string): number;
    bool(key: string): boolean;
    arr(key: string): string[];
  };
}

//#endregion

/**
 * Class for working with cli arguments
 *
 */
export class Arg implements IArg {
  private static _singletonInstance: Arg;

  private _args: string[] = [];

  private _params: IArgParamList = {};

  private _aliases: string[][] = [];

  constructor(options?: IArgOptions) {
    if (!(this instanceof Arg)) {
      return new Arg(options);
    }

    if (options?.isTest) {
      return;
    }

    if (Arg._singletonInstance) {
      return Arg._singletonInstance;
    }

    Arg._singletonInstance = this;

    this.parseArgv();
  }

  parseArgv(): void {
    this.parse(...process.argv.slice(2));
  }

  params(params: IArgParamList) {
    this._params = {};
    this._aliases = [];

    let param;

    for (const k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k)) {
        param = params[k];

        this.param(
          param.alias ? [k, param.alias].join(',') : k,
          param.default,
          param.description,
          param.type,
          param.flag,
          param.required
        );
      }
    }
  }

  parse(...args: string[]) {
    const reg = /(-{1,2}[^=\s]+)[=\s](.*)/;

    this._args = args
      .join(' ')
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean)
      .reduce<string[]>((accumulator, str) => {
        if (reg.test(str)) {
          const [, key, v] = reg.exec(str) || [];

          return [...accumulator, key, v];
        }

        return [...accumulator, str];
      }, []);
  }

  /**
   *
   * @param {string} name name of param, can be split by semicolon
   * @param defaultValue
   * @param description
   * @param type
   * @param {boolean} isFlag
   * @param {boolean} required
   *
   * @example
   * const arg = new Arg();
   * arg.param('version,v', 'v0.0.1', 'Show version');
   */
  param(
    name: string,
    defaultValue?: any,
    description?: string,
    type?: IArgParamItem['type'],
    isFlag = false,
    required = false
  ) {
    const [keyName, ...listNames] = name
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (this._params[keyName]) {
      throw new Error(`Argument "${keyName}" already defined.`);
    }

    this._params[keyName] = {
      type: type || 'string',
      default: defaultValue || '',
      description: description || '',
      flag: isFlag,
      required,
    };

    if (listNames.length) {
      addAlias(this._aliases, keyName, ...listNames);
    }

    if (listNames.length) {
      this.param(
        listNames.join(','),
        defaultValue,
        description,
        type,
        isFlag,
        required
      );
    }
    return this;
  }

  getCurrentParams(): IArgParamList {
    return JSON.parse(JSON.stringify(this._params));
  }

  get val() {
    const fn = (
      key: string,
      type?: IArgParamItem['type']
    ): DefaultValue | DefaultValue[] => {
      const param = this._params[key];

      const result: string[] = getArgumentsByKey(
        this._args,
        this._aliases,
        key,
        param?.flag
      );

      if (
        result === undefined ||
        (result.length === 0 && param?.type !== 'boolean')
      ) {
        return param?.default === undefined ? null : param.default;
      }

      const t = type || param?.type || 'string';

      return convertToType(t, result);
    };
    //

    fn.str = (key: string) => fn(key, 'string') as string;

    fn.num = (key: string) => fn(key, 'number') as number;

    fn.bool = (key: string) => fn(key, 'boolean') as boolean;

    fn.arr = (key: string) => fn(key, 'array') as string[];

    return fn;
  }
}
