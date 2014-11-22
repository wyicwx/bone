#bone.fs API列表

+ [pathResolve()](#pathresolvefilepath-dir)
+ [createReadStream()](#createreadstreamfilepath)
+ [mkdir()](#mkdirdir)
+ [rm()](#rmfilepath)
+ [createWriteStream()](#createwritestreamfilepath-option)
+ [readFile()](#readfilefilepath-callback)
+ [search()](#searchsearchvalue-option)
+ [refresh()](#refresh)
+ [readDir()](#readdirdir)
+ [existFile()](#existfilefilepath)

**注意**:`bone.fs`对象在`bone.setup()`执行之后才能调用

####pathResolve(filepath, dir)
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

####createReadStream(filepath)
创建一个读取虚拟文件或者真实文件的流对象，当读取的文件不存在时会丢出一个错误

```js
bone.dest('dist')
	.src('~/main.js')

bone.setup('./');

var stream = bone.fs.createReadStream('~/dist/main.js');
```

####mkdir(dir)
创建文件夹，支持递归创建

```js
bone.fs.mkdir('~/dist/release/js');
```

####rm(filepath)
删除文件或文件夹，当传入参数是一个文件夹时会删除其子文件夹及文件

```js
bone.fs.rm('~/dist')
```

####createWriteStream(filepath, option)
创建一个本地文件的写入流，参数focus强制建立文件夹，在不存在的文件夹路径下创建并且没有传入focus参数会报错

```js
var rStream = bone.fs.createReadStream('')
var wStream = bone.fs.createWriteStream('~/dist/release/js/main.js', {
	focus: true
});
rStream.pipe(wStream);
```

####readFile(filepath, callback)
读取文件

```js
bone.fs.readFile('~/dist/not/exist/file.js', function(e, buffer) {
	if(e) {
		console.log(e);
	}
});
```

####search(searchValue, option)
支持[glob](https://github.com/isaacs/node-glob)语法的文件搜索，传入notFs参数仅搜索虚拟文件

```js
bone.dest('dist')
	.src([
		'~/src/main.js',
		'~/src/lib/jquery.js'
	]);
bone.setup('/base/path');

bone.search('./**/*');
// return
'/base/path/dist/main.js'
'/base/path/dist/jquery.js'
'/base/path/src/main.js'
'/base/path/src/lib/jquery.js'

bone.search('./**/*', {
	notFs: true
});
// return
'/base/path/dist/main.js'
'/base/path/dist/jquery.js'
```
####refresh()
刷新文件映射关系


####readDir(dir)
读取文件，传入参数notFs仅读取虚拟文件夹

```js
bone.dest('dist')
	.src([
		'~/src/main.js',
		'~/src/lib/jquery.js'
	]);
bone.setup('/base/path');

bone.fs.readDir('./dist');
// return
['main.js', 'jquery.js']

bone.fs.readDir('~/src', {
	notFs: true
});
// return
[]
```

####existFile(filePath)
返回文件是否存在，传入参数notFs仅判断虚拟文件

```js
bone.dest('dist')
	.src([
		'~/src/main.js',
		'~/src/lib/jquery.js'
	]);
bone.setup('/base/path');

bone.fs.existFile('./dist/main.js');
// return
true

bone.fs.existFile('./dist/index.js');
// return
false

bone.fs.existFile('~/src/main.js');
// return
true

bone.fs.existFile('~/src/main.js', {
	notFs: true
});
// return
false
```