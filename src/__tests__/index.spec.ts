import { Arg, IArgParamList } from '..';

describe('Test Arg class', () => {
  let arg: Arg;

  beforeEach(() => {
    arg = new Arg({ isTest: true });
  });

  describe('val:', () => {
    beforeEach(() => {
      arg.parse('--param 01');
    });

    it('defaut', () => {
      expect(arg.val('param')).toBe('01');
    });

    it('string', () => {
      expect(arg.val.str('param')).toBe('01');
    });

    it('number', () => {
      expect(arg.val.num('param')).toBe(1);
    });

    it('boolean', () => {
      expect(arg.val.bool('param')).toBe(true);
    });

    it('array', () => {
      expect(arg.val.arr('param')).toEqual(['01']);
    });
  });

  // it.each(<[IArgParamItem['type'], any, any][]>[
  //   // / type, input, output
  //   ['string', 101, '101'],
  //   ['string', true, 'true'],
  //   ['string', '', ''],
  //   ['number', true, 1],
  //   ['number', false, 0],
  //   ['boolean', '', false],
  //   ['boolean', '0', true],
  //   ['boolean', 'true', true],
  //   ['boolean', 'TRUE', true],
  //   ['boolean', 'true', true],
  //   ['boolean', 'false', false],
  //   ['boolean', 'FALSE', false],
  //   ['array', 'xxx', ['xxx']],
  //   //
  // ])('convertToType(%s, %o): %o', (type, input, expected) => {
  //   expect(arg.convertToType(type, input)).toEqual(expected);
  // });

  it.each([
    // /
    ['--clone https://github.com/avil13', 'clone', 'c'],
    // ['-c https://github.com/avil13', 'clone', 'c'],
  ])('argument alias are equal: "%s", [%s,%s]', (input, alias1, alias2) => {
    arg.parse(input);
    arg.param(`${alias1},${alias2}`, null, 'some description');

    expect(arg.val(alias1)).toBe(arg.val(alias2));
  });

  it('set param by signature', () => {
    const defaultStr = 'default data';

    arg.param('str,s', defaultStr, '...', 'string');

    expect(arg.val('str')).toBe(defaultStr);
  });

  it('set params by options', () => {
    const defaultVal = 101;

    const params: IArgParamList = {
      num: {
        type: 'number',
        alias: 'n-u-m-b-e-r',
        default: defaultVal,
        description: 'max value',
      },
      unusedFlag: {
        type: 'string',
        alias: 'un',
        default: '',
        description: 'To test the operation unused parameter',
      },
      add: {
        flag: true,
        type: 'array',
        default: ['.'],
        description: 'Add alias by path',
      },
    };

    arg.params(params);

    expect(arg.val('num')).toBe(defaultVal);
    expect(arg.val('n-u-m-b-e-r')).toBe(defaultVal);
    expect(arg.val('un')).toBe('');

    arg.parse('-num 102');
    expect(arg.val('num')).toBe(102);
    expect(arg.val('un')).toBe('');

    arg.parse('add path/to/folder alias')
    expect(arg.val.arr('add')).toEqual(['path/to/folder', 'alias']);

    arg.parse('add')
    expect(arg.val.arr('add')).toEqual(['.']);
  });
});
