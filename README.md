# Bone 
> 基于虚拟文件系统的js构建工具

<img src="/bone.png" alt="bone" width="50%"/>

[![travis](https://api.travis-ci.org/wyicwx/bone.png)](https://travis-ci.org/wyicwx/bone) [![Coverage Status](https://coveralls.io/repos/wyicwx/bone/badge.png?branch=master)](https://coveralls.io/r/wyicwx/bone?branch=master)

Bone提供一种简单的方式来将一个真实存在的文件映射成一个虚拟的文件，并可以在映射的同时通过[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)对源文件做一些处理。

###文档

+ 快速上手？点击[快速上手](https://github.com/wyicwx/bone/blob/master/docs/getting-started.md)

+ 如何[定义一个文件](https://github.com/wyicwx/bone/blob/master/docs/file.md)

+ bone.fs接口文档查看[API](https://github.com/wyicwx/bone/blob/master/docs/api.md)文档

###示例

这是一个简单bone配置例子的示范，你需要在项目文件夹下创建`bonefile.js`文件，并安装[bone-cli](https://github.com/wyicwx/bone-cli)


```js
var bone = require('bone');
var connect = require('bone-connect');
var less = require('bone-less');
var concat = require('bone-concat');

// 定义release文件夹，用来存放最终的文件
var dist = bone.dest('dist');

// 在dist下定义文件夹css
dist.dest('css')
	// 指定映射来源src/less下所有.less后缀的文件
   .src('~/src/less/*.less')
   // 所有文件都经过less处理
   .act(less({
   		ieCompat: false
   }))
   // 并重命名为.css后缀
   .rename(function(filename) {
		return filename.replace(/\.less$/, '.css');
   });

// 在dist下定义文件夹html
dist.dest('html')
	// 映射src/下将所有.html文件
	.src('~/src/*.html');

// 在dist下定义文件夹js
dist.dest('js')
	// 指定映射来源文件为src/main.js
	.src('~/src/main.js')
	// 将源文件与src/lib下所有.js后缀的文件合并
	.act(concat({
		files: '~/src/lib/*.js'
	}));

// 加载支持connect的插件
bone.cli(connect({
	base: './dist'
}));
```

安装示例中的依赖
```sh
$ npm install bone bone-connect bone-less bone-concat --save-dev
```


###可用的处理器

+ [bone-less](https://github.com/wyicwx/bone-less) less编译器
+ [bone-concat](https://github.com/wyicwx/bone-concat) 文件合并
+ [bone-htmlminify](https://github.com/wyicwx/bone-htmlminify) html压缩
+ [bone-include](https://github.com/wyicwx/bone-include) include功能
+ [bone-uglify](https://github.com/wyicwx/bone-uglify) uglify压缩器支持js和css压缩
