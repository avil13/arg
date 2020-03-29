### avil13/arg

NodeJS package for simple use arguments in cli.

example:

```sh
# bash
npm install @avil13/arg
```

```js
const Arg = require('@avil13/arg');

const arg = new Arg();
```
Further, "app" is the name of your application.

```js
// app --name Leo
arg.val('name'); // => Leo
```
```js
// app --name Leo --day 1 --show --list hello world
arg.val.str('name'); // => Leo
arg.val.num('day'); // => 1
arg.val.bool('show'); // => true
arg.val.arr('list'); // => ['hello', 'world']
```