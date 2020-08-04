export interface IArgOptions {
  isTest?: boolean;
}

type DefaultValue = null | string | number | boolean;

export interface IArgHelpWrapper {
  [key: string]: IParamItem;
}

export interface IParamItem {
  keys: string[];
  defaultValue?: DefaultValue;
  description?: string;
  type?: IArgParamItem['type'];
  isFlag?: boolean;
}

export interface IArgParamList {
  [key: string]: IArgParamItem;
}

export interface IArgParamItem {
  type: 'string' | 'number' | 'array' | 'boolean';
  default?: string | number | boolean | string[];
  description?: string;
  alias?: string;
  string?: boolean;
  required?: boolean;
  flag?: boolean;
}

/**
 * Class for working with cli arguments
 *
 */
export class Arg {
  // list parsed arguments
  private _argRawItems: any = {};

  private _argHelpWrapper: IArgHelpWrapper = {};

  private _allArgNames: string[] = [];

  private static _singletonInstance: Arg;

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

  parse(...argList: string[]): Arg {
    const flags = Object.keys(this._argHelpWrapper).filter(
      (key) => this._argHelpWrapper[key].isFlag
    );

    let args = [...argList];

    if (flags.length) {
      args = args.join(' ').split(' ').filter(Boolean);

      args.forEach((item, index, arr) => {
        if (flags.includes(item)) {
          arr[index] = `--${item}`;
        }
      });
    }

    const argStr = args.join(' ');
    const reg = new RegExp(`-{1,2}([^\\s]+)(.*?(?=\\s-)|.*)`, 'g');

    argStr.replace(reg, ($0, key: string, value?: string) => {
      if (!value) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this._argRawItems[key] =
          this._argHelpWrapper[key]?.defaultValue || true;
      } else {
        const v = value
          .split(/\s{1,}/)
          .filter((v1: string) => !!v1)
          .map((v2: string) => v2.trim());

        this._argRawItems[key] = v.length > 1 ? v : v[0];
      }
      return $0;
    });

    return this;
  }

  get val() {
    const fn = (key: string) => {
      this.checkKey(key);
      const opt = this.getOptionsByKey(key);

      const value = this.getValueByKey(key);

      if (opt?.type) {
        return this.convertToType(opt.type, value || opt.defaultValue);
      }
      return value;
    };

    fn.str = (key: string) => this.convertToType('string', fn(key)) as string;
    fn.num = (key: string) => this.convertToType('number', fn(key)) as number;
    fn.bool = (key: string) =>
      this.convertToType('boolean', fn(key)) as boolean;
    fn.arr = (key: string) => this.convertToType('array', fn(key)) as string[];

    return fn;
  }

  checkKey(key: string) {
    if (this.getValueByKey(key) === undefined) {
      throw new Error(`Can't find argument "${key}"`);
    }
  }

  private getValueByKey(key: string) {
    if (this._argRawItems[key]) {
      return this._argRawItems[key];
    }
    const options = this.getOptionsByKey(key);

    if (options) {
      for (let i = 0; i < options.keys.length; i++) {
        const optionKey = options.keys[i];

        if (this._argRawItems[optionKey] !== undefined) {
          return this._argRawItems[optionKey];
        }
      }
    }
  }

  private getOptionsByKey(key: string): IParamItem | undefined {
    let option;
    let keyLen = 0;
    for (const k in this._argHelpWrapper) {
      if (Object.prototype.hasOwnProperty.call(this._argHelpWrapper, k)) {
        option = this._argHelpWrapper[k];
        keyLen = option.keys.length;

        for (let i = 0; i < keyLen; i++) {
          if (option.keys[i] === key) {
            return option;
          }
        }
      }
    }
  }

  convertToType(
    type: IArgParamItem['type'],
    value: DefaultValue | DefaultValue[]
  ) {
    switch (type) {
      case 'boolean':
        if (
          typeof value === 'string' &&
          ['true', 'false'].includes(value.toLowerCase())
        ) {
          return value.toLowerCase() === 'true';
        }
        return Boolean(value);
      case 'number':
        return Number(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'string':
        return Array.isArray(value) ? value.join(' ') : String(value);
      default:
        return value;
    }
  }

  params(params: IArgParamList) {
    let parameter: IArgParamItem;
    let key = '';
    for (const k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k)) {
        key = k;
        parameter = params[k];
        if (parameter.alias) {
          key = [k, parameter.alias].join(',');
        }
        this.param(
          key,
          parameter.default,
          parameter.description,
          parameter.type,
          parameter.flag
        );
      }
    }
  }

  /**
   *
   * @param {string} name name of param, can be split by semicolon
   * @param defaultValue
   * @param description
   * @param type
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
    isFlag?: boolean
  ) {
    let parentKey = '';

    name
      .split(',')
      .map((s) => s.trim())
      .forEach((key, i) => {
        if (this._allArgNames.includes(key)) {
          throw new Error(`Argument "${key}" already defined.`);
        }

        this._allArgNames.push(key);

        if (i === 0) {
          parentKey = key;

          this._argHelpWrapper[parentKey] = {
            keys: [key],
            defaultValue,
            description,
            type,
            isFlag,
          };

          if (
            this._argRawItems[key] === undefined &&
            ['boolean', 'string', 'number'].includes(typeof defaultValue)
          ) {
            this._argRawItems[key] = defaultValue;
          }
        } else {
          this._argHelpWrapper[parentKey].keys.push(key);
        }
      });

    return this;
  }

  getHelp(): string {
    const results: string[] = [];

    for (const k in this._argHelpWrapper) {
      if (Object.prototype.hasOwnProperty.call(this._argHelpWrapper, k)) {
        results.push(this.getHelpString(this._argHelpWrapper[k]));
      }
    }

    return results.join('\n');
  }

  getHelpString(item: IParamItem): string {
    const keys = item.keys
      .map((v, i) => `${i === 0 ? '-' : ''}-${v}`)
      .join(', ');
    const description = item.description || '';
    const defaultValue = item.defaultValue && `default: ${ item.defaultValue }`;

    return [` ${keys}`, defaultValue, description]
      .filter((v) => !!v)
      .join('\t');
  }
}
