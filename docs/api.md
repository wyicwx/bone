#bone.fs API列表

+ [pathResolve()](#pathresolvefile-dir)
+ [createReadStream()](#createreadstream)
+ [mkdir()](#mkdir)
+ [rm()](#rm)
+ [createWriteStream()](#createwritestream)
+ [readFile()](#readfile)
+ [search()](#search)
+ [register()](#register)
+ [refresh()](#refresh)
+ [readDir()](#readdir)
+ [existFile()](#existfile)

####pathResolve(file, dir)
解析文件路径为绝对路径

在bone中支持`~`,`./`,`../`,`/`四种定位方式都通过`pathResolve`函数来解析。
参数dir没有定义的情况下为bone.fs.base，即`bone.setup(base)`

```js
bone.setup('/base/path');

bone.fs.pathResolve('~/a/b/c');
// return
'/base/path/a/b/c'

bone.fs.pathResolve('./a/b/c');
// return
'/base/path/a/b/c'

bone.fs.pathResolve('./a/b/c', '/base/otherpath');
// return
'/base/otherpath/a/b/c'

bone.fs.pathResolve('../');
// return
'/base'

bone.fs.pathResolve('/base/otherpath');
// return
'/base/otherpath'
```

####createReadStream()
创建一个读取虚拟文件或者真实文件的流对象

```js
bone.dest('dist')
	.src('~/main.js')

bone.setup('./');

var stream = bone.fs.createReadStream('~/dist/main.js');
```

####mkdir()
创建文件夹，支持递归创建

```js
bone.fs.mkdir('~/dist/release/js');
```

####rm()
删除文件或文件夹，当传入参数是一个文件夹时会删除其子文件夹及文件

```js
bone.fs.rm('~/dist')
```

####createWriteStream()


####readFile()
####search()
####register()
####refresh()
####readDir()
####existFile()