import { IArgParamItem } from './..';
import {
  addAlias,
  TAliasLists,
  TArgs,
  hasKeyInArgs,
  getExistsAliasParamName,
  getArgumentsByKey,
  convertToType,
} from './../helpers';

describe('Helpers', () => {
  it('addAlias', () => {
    const aliases: TAliasLists = [];
    addAlias(aliases, 'ls', 'list');

    expect(aliases).toEqual([['ls', 'list']]);
  });

  it('addAlias [bad]', () => {
    let aliases: TAliasLists = [];

    addAlias(aliases);
    expect(aliases).toEqual([]);

    addAlias(aliases, 'cm');
    expect(aliases).toEqual([]);

    aliases = [['ls']];

    addAlias(aliases, 'commit', 'cm');
    expect(aliases).toEqual([['ls'], ['commit', 'cm']]);
  });

  it('hasKeyInArgs', () => {
    const args: TArgs = ['-ls', '1', '2'];

    expect(hasKeyInArgs(args, 'ls')).toBe(true);
    expect(hasKeyInArgs(args, 'time')).toBe(false);
  });

  it('getExistsAliasParamName', () => {
    const args: TArgs = ['-ls', '1', '2'];
    const aliases: TAliasLists = [['ls', 'list', 'l']];

    expect(getExistsAliasParamName(args, aliases, 'ls')).toBe('ls');
    expect(getExistsAliasParamName(args, aliases, 'list')).toBe('ls');
    expect(getExistsAliasParamName(args, aliases, 'l')).toBe('ls');
    expect(getExistsAliasParamName(args, aliases, 'nope')).toBe(undefined);
  });

  it('getArgumentsByKey', () => {
    const args: TArgs = ['-ls', '1', '2', '--bool'];
    const aliases: TAliasLists = [['ls', 'list', 'l']];

    expect(getArgumentsByKey(args, aliases, 'list')).toEqual(['1', '2']);
    expect(getArgumentsByKey(args, aliases, 'ls')).toEqual(['1', '2']);
    expect(getArgumentsByKey(args, aliases, 'l')).toEqual(['1', '2']);
    expect(getArgumentsByKey(args, aliases, 'bool')).toEqual([]);
  });

  it.each(<[IArgParamItem['type'], any, any][]>[
    // / type, input, output
    ['string', 101, '101'],
    ['string', true, 'true'],
    ['string', '', ''],
    ['number', true, 0],
    ['number', false, 0],
    ['boolean', '', true],
    ['boolean', '0', true],
    ['boolean', 'true', true],
    ['boolean', 'TRUE', true],
    ['boolean', 'true', true],
    ['boolean', 'false', false],
    ['boolean', 'FALSE', false],
    ['array', 'xxx', ['xxx']],
    //
  ])('convertToType(%s, %o): %o', (type, input, expected) => {
    expect(convertToType(type, input)).toEqual(expected);
  });
});
