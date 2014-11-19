# 新手上路

###1.通过npm安装bone到你的项目中
```sh
$ npm install bone --save-dev
```
###2.创建`bonefile.js`
```js
var bone = require('bone');
```
###3.通过`dest()`定义你的虚拟文件
```js
bone.dest('dist')
	.src('~/src/**/*');
```
###4.设置你的虚拟根目录
```js
bone.setup('./');
```
###5.调用bone.fs的API或者使用CLI来操作虚拟文件

+ bone.fs的API请查看[API](https://github.com/wyicwx/bone/blob/master/docs/api.md)文档获取相关说明

+ cli请参考[bone-cli](https://github.com/wyicwx/bone-cli)模块用法

###其他

+ [处理单元开发](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)