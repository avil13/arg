### avil13/arg

NodeJS package for simple use arguments in cli.

example:

```bash
# bash
npm install @avil13/arg
```

```ts
import { Arg } from '@avil13/arg';

const arg = new Arg();
```
Further, "app" is the name of your application.

```ts
// app --name Leo
arg.val('name'); // => Leo
```
```ts
// app --name Leo --day 1 --show --list hello world
arg.val.str('name'); // => Leo
arg.val.num('day'); // => 1
arg.val.bool('show'); // => true
arg.val.arr('list'); // => ['hello', 'world']
```
