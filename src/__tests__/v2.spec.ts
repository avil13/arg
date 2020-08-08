import { Arg, IArgParamItem, IArgParamList, DefaultValue } from '../v2';

describe('Test Arg class', () => {
  let arg: Arg;

  beforeEach(() => {
    arg = new Arg({ isTest: true });
    arg.params({});
  });

  it('params(...)', () => {
    const conf: IArgParamItem = {
      type: 'string',
      alias: 'l',
    };

    arg.params({ ls: conf });

    const currentParams = arg.getCurrentParams();

    expect(currentParams).toEqual({
      ls: {
        type: 'string',
        default: '',
        description: '',
        flag: false,
        required: false,
      },
      l: {
        type: 'string',
        default: '',
        description: '',
        flag: false,
        required: false,
      },
    });
  });

  it.each<[string, [string, DefaultValue]]>([
    //
    ['-ls=dir -depth=2', ['ls', 'dir']],
    ['-ls=dir -depth=2', ['depth', '2']],
    ['-ls dir -depth 2', ['ls', 'dir']],
    ['--ls dir --depth 2', ['depth', '2']],
  ])('val(%s): %s', (input, expected) => {
    arg.parse(input);

    const [key, value] = expected;

    expect(arg.val(key)).toBe(value);
  });

  it.each<
    [string, [string, DefaultValue | DefaultValue[]], IArgParamItem | null]
  >([
    //
    ['-ls=dir -depth=20', ['ls', 'dir'], null],
    ['-ls=dir -depth=21', ['l', 'dir'], null],
    //
    ['-ls -depth 22', ['ls', true], { type: 'boolean' }],
    ['-ls -depth 23', ['l', true], { type: 'boolean' }],
    ['-ls true -depth 23', ['l', true], { type: 'boolean' }],
    ['-ls True -depth 23', ['l', true], { type: 'boolean' }],
    ['-ls false -depth 23', ['l', false], { type: 'boolean' }],
    //
    ['-ls -depth 24', ['ls', ''], { type: 'string' }],
    ['-ls -depth 25', ['l', ''], { type: 'string' }],
    //
    ['-ls 2 -depth 26', ['ls', 2], { type: 'number' }],
    //
    ['-ls 2 3 4 -depth 27', ['ls', ['2', '3', '4']], { type: 'array' }],
    ['-ls 2 3 4 -depth 27', ['l', ['2', '3', '4']], { type: 'array' }],
    ['-ls 2 3 4', ['l', ['2', '3', '4']], { type: 'array' }],
    //
    ['-ls 101', ['l', true], { type: 'boolean' }],
    ['-ls 101', ['l', '101'], { type: 'string' }],
    ['-ls 101', ['l', 101], { type: 'number' }],
    ['-ls 101', ['l', ['101']], { type: 'array' }],
    //
    ['-ls', ['l', ['def', 'val']], { type: 'array', default: ['def', 'val'] }],
  ])('Param: val(%s): %s\t%o', (input, expected, param) => {
    const conf: IArgParamList = {
      ls: {
        type: 'string',
        // default: '',
        description: 'nope',
        alias: 'l',
        required: false,
        flag: false,
        ...param,
      },
    };

    arg.params(conf);
    arg.parse(input);

    const [key, value] = expected;

    expect(arg.val(key)).toEqual(value);
  });

  // it('getExistsAliasParamName', () => {
  //   const conf: IArgParamItem = {
  //     type: 'string',
  //     alias: 'l,list',
  //   };

  //   arg.params({ ls: conf });

  //   arg.parse('--list');

  //   expect(arg.getExistsAliasParamName('l')).toBe('list');

  //   expect(arg.getExistsAliasParamName('nope')).toBe(undefined);
  // });
});

describe('Exceptions', () => {
  let arg: Arg;

  beforeEach(() => {
    arg = new Arg({ isTest: true });
    arg.params({});
  });

  it('argument already exists ', () => {
    try {
      arg.params({
        ls: { type: 'string', alias: 'ls' },
      });
    } catch (err) {
      const msg = (err as Error).message;

      expect(msg).toEqual('Argument "ls" already defined.');
    }
  });

  // it('addAlias', () => {
  //   expect(arg.addAlias('')).toBe(undefined);
  // });
});

describe('Test constructor in Arg', () => {
  it('singleton', () => {
    const arg1 = new Arg();
    const arg2 = new Arg();

    expect(arg1).toEqual(arg2);
  });

  it('auto construct', () => {
    // @ts-ignore
    const arg1 = Arg();

    expect(arg1 instanceof Arg).toBe(true);
  });
});
