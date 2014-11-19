# Bone 
> 基于虚拟文件系统的js构建工具

<img src="/bone.gif" alt="bone" style="width: 50%;" />

[![travis](https://api.travis-ci.org/wyicwx/bone.png)](https://travis-ci.org/wyicwx/bone)

Bone提供一种简单的方式来将一个真实存在的文件映射成一个虚拟的文件，并可以在映射的同时做一些文本上处理，这使得被映射的文件可以拥有原生js所不具有的各种各样的能力。

###文档

快速上手？点击[快速上手](https://github.com/wyicwx/bone/blob/master/docs/getting-started.md)

点击查看[API](https://github.com/wyicwx/bone/blob/master/docs/api.md)文档

###示例

这是一个简单的bone配置例子，你需要在项目文件夹下创建`bonefile.js`文件，并安装[bone-cli](https://github.com/wyicwx/bone-cli)

```js
var bone = require('bone');
var connect = require('bone-connect');
var less = require('bone-less');
var concat = require('bone-concat');

// 定义编译文件夹，用来存放一些经过处理的文件
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
```

