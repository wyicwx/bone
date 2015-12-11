#fs API列表

+ [pathResolve()](#pathresolvefilepath-dir)
+ [createReadStream()](#createreadstreamfilepath)
+ [mkdir()](#mkdirdir)
+ [rm()](#rmfilepath)
+ [createWriteStream()](#createwritestreamfilepath-option)
+ [readFile()](#readfilefilepath-option-callback)
+ [writeFile()](#writefilefilepath-callback)
+ [search()](#searchsearchvalue-option)
+ [refresh()](#refresh)
+ [readDir()](#readdirdir)
+ [existFile()](#existfilefilepath)

**注意**:`fs`对象只有在`处理器`和`自定义命令行`内通过参数传递获得

####pathResolve(filePath, dir)
解析文件路径为绝对路径

在bone中支持`~`,`./`,`../`,`/`四种定位方式都通过`pathResolve`函数来解析。
参数dir没有定义的情况下为bone.status.base，即`bone.setup(base)`传递的参数base

```js
bone.setup('/base/path');

fs.pathResolve('~/a/b/c');
// return
'/base/path/a/b/c'

fs.pathResolve('./a/b/c');
// return
'/base/path/a/b/c'

fs.pathResolve('./a/b/c', '/base/otherpath');
// return
'/base/otherpath/a/b/c'

fs.pathResolve('../');
// return
'/base'

fs.pathResolve('/base/otherpath');
// return
'/base/otherpath'
```

####createReadStream(filePath)
创建一个读取虚拟文件或者真实文件的流对象，当读取的文件不存在时会丢出一个错误

通过option可传递act对象，读取文件后再经过act处理

```js
bone.dest('dist')
	.src('~/main.js')

bone.setup('./');

var stream = fs.createReadStream('~/dist/main.js');

var streamAct = fs.createReadStream('~/dist/main.js', {
	act: concat()
});
```

####mkdir(dir)
创建文件夹，支持递归创建

```js
fs.mkdir('~/dist/release/js');
```

####rm(filePath)
删除文件或文件夹，当传入参数是一个文件夹时会删除其子文件夹及文件

*ps:*这个函数非常危险，请确认后再使用

```js
fs.rm('~/dist')
```

####createWriteStream(filePath, option)
创建一个本地文件的写入流，参数focus强制建立文件夹

没有传入focus参数的情况下，在不存在的文件夹路径下创建文件会报错

```js
var rStream = fs.createReadStream('')
var wStream = fs.createWriteStream('~/dist/release/js/main.js', {
	focus: true
});
rStream.pipe(wStream);
```

####readFile(filePath, option, callback)
读取文件

参数同[createReadStream()](#createreadstreamfilepath)

```js
fs.readFile('~/dist/not/exist/file.js', function(e, buffer) {
	if(e) {
		console.log(e);
	}
});

fs.readFile('~/dist/app.js', {
	act: concat()
}, function(e, buffer) {
	console.log(buffer.toString());
})
```

####writeFile(filePath, callback)
写文件

参数同[createWriteStream()](#createwritestreamfilepath-option)

```js
fs.writeFile('~/dist/foo.js', 'hello world', {
	focus: true
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

fs.readDir('./dist');
// return
['main.js', 'jquery.js']

fs.readDir('~/src', {
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

fs.existFile('./dist/main.js');
// return
true

fs.existFile('./dist/index.js');
// return
false

fs.existFile('~/src/main.js');
// return
true

fs.existFile('~/src/main.js', {
	notFs: true
});
// return
false
```