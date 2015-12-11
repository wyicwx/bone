# 新手上路

###1.通过npm安装bone到你的项目中
```sh
$ npm install bone --save-dev
```
###2.创建`bonefile.js`
```shell
touch bonefile.js
```
打开并编辑bonefile.js文件
```js
var bone = require('bone');
```
###3.通过`dest()`定义你的虚拟文件夹
```js
var bone = require('bone');

bone.dest('dist')
	.src('~/src/**/*');
```
###4.设置你的虚拟根目录
```js
var bone = require('bone');

bone.dest('dist')
	.src('~/src/**/*');

bone.setup('./');
```
###5.调用bone内置命令`bone build`生成文件
```shell
$ bone build
```
**注**:main.js文件在src文件夹下，通过bone映射到了dist/main.js

bone.fs的API请查看[API](https://github.com/wyicwx/bone/blob/master/docs/api.md)文档获取相关说明

关于`bone.dest()`如何[定义一个文件](https://github.com/wyicwx/bone/blob/master/docs/file.md)

###其他

+ 命令行工具请参考[bone-cli](https://github.com/wyicwx/bone-cli)模块
+ 如何使用并开发自定义[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)