1. 通过npm安装bone到你的项目中
```sh
$ npm install bone --save-dev
```
2. 创建`bonefile.js`
```js
var bone = require('bone');
```
3. 通过`dest()`定义你的虚拟文件
```js
bone.dest('dist')
	.src('~/src/**/*');
```
4.设置你的虚拟根目录
```js
bone.setup('./');
```
5.调用bone.fs的API或者使用[bone-cli](https://github.com/wyicwx/bone-cli)来操作虚拟文件