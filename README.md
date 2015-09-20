# Bone 
> web前端开发构建工具集核心

<img src="/bone.png" alt="bone" width="50%"/>

[![travis](https://api.travis-ci.org/wyicwx/bone.png)](https://travis-ci.org/wyicwx/bone) [![Coverage Status](https://coveralls.io/repos/wyicwx/bone/badge.png?branch=master)](https://coveralls.io/r/wyicwx/bone?branch=master)

###又一个轮子？

　　不，Bone和Grunt&Gulp截然不同！Bone Bone提供一种简易的方式来整合前端开发在开发阶段的各种工具，通过各种[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)来对源文件进行处理。当然Bone和Grunt&Gulp并不冲突，通过Bone处理后的文件可以再通过其他的构建工具进行进一步的处理。

###核心

　　这个模块是Bone的核心功能，为了让使用者更容易读懂Bone的配置文件，核心模块提供了一种类似操作系统里文件系统的概念，我称它为虚拟文件系统，即将一个虚拟的文件地址映射到一个真实存在的文件地址上，同时可以标注虚拟文件是由何种方式对源文件处理（注意这里不对真实文件做任何处理，源文件是指对真实文件的在内容上的拷贝），对源文件的处理模块我称它为[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)，通过下面的示例你可以对Bone的虚拟文件系统有一个初步的了解。

###示例

这是一个简单Bone配置例子的示范，你需要在项目文件夹下创建`bonefile.js`文件，并安装[bone-cli](https://github.com/wyicwx/bone-cli)

```js
var bone = require('bone');
var connect = require('bone-cli-connect');
var less = require('bone-act-less');
var concat = require('bone-act-concat');

// 定义生成文件夹dist，用来存放最终的文件
var dist = bone.dest('dist');

// 在dist下定义文件夹css（通过dist变量的链式调用为指定定义再其下的文件）
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
	base: './dist',
	port: 8080
}));
```

**ps**:'~/'符号指bonefile.js文件所在的文件夹位置，Bone中的文件路径都使用fs.pathResolve解析，详情请参阅[api](https://github.com/wyicwx/bone/blob/master/docs/api.md#pathresolvefilepath-dir)

安装示例中的依赖
```sh
$ npm install bone bone-connect bone-act-less bone-act-concat --save-dev
```

启用connect后通过浏览http://localhost:8080查看文件
```sh
$ bone connect
```

###文档

+ 快速上手？点击[快速上手](https://github.com/wyicwx/bone/blob/master/docs/getting-started.md)
+ 如何[定义虚拟文件](https://github.com/wyicwx/bone/blob/master/docs/file.md)
+ bone.fs接口调用文档 [API](https://github.com/wyicwx/bone/blob/master/docs/api.md)

###常用处理器

+ [bone-act-less](https://github.com/wyicwx/bone-act-less) less编译器
+ [bone-act-sass](https://github.com/jansesun/bone-act-sass) sass编译器
+ [bone-act-concat](https://github.com/wyicwx/bone-act-concat) 文件合并
+ [bone-act-include](https://github.com/wyicwx/bone-act-include) include功能
+ [bone-act-uglify](https://github.com/wyicwx/bone-act-uglify) uglify压缩器支持js和css压缩
