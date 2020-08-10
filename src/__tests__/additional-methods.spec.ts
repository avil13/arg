import { Arg } from '..';

describe('Test Arg class', () => {
  let arg: Arg;

  beforeEach(() => {
    arg = new Arg({ isTest: true });
    arg.params({});
  });

  xit('isEmpty', () => {
    arg.parse('');
    expect(arg.isEmpty).toBe(true);

    arg.parse('-ls');
    expect(arg.isEmpty).toBe(false);
  });

  xit('stopAndShowMsg', () => {
    // const exitHandle = (code?: number) => code as never;
    // const consoleLogHandle = (code?: number) => code as never;

    // const mockExit = jest.spyOn(process, 'exit').mockImplementation(exitHandle);
    // const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(consoleLogHandle);
    // //
    // const ERROR_CODE = 0;
    // const MSG = 'Good bye';

    // arg.stopAndShowMsg(MSG);

    // expect(mockConsoleLog).toHaveBeenCalledWith(MSG);
    // expect(mockExit).toHaveBeenCalledWith(ERROR_CODE);
  });

  it('getHelpMsg', () => {
    // const conf: IArgParamList = {
    //   ls: {
    //     type: 'string',
    //     description: 'list directory contents',
    //   },
    // };

    // arg.params(conf);

    // const msg = arg.getHelpMsg();
    // const res = '';

    // expect(msg).toBe(res);
  });
});
