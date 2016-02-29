# 内建api

bone提供fs对象来访问虚拟文件系统，fs对象的接口也可以用于访问本地文件系统。有两种方式能获得fs对象：

1、通过处理器的runtime获得
```javascript
bone.wrapper(function(buffer, encoding, callback) {
    var fs = this.fs;

    callback(null, buffer);
});
```
2、通过cli的参数获得
```javascript
exports = function(command, bone, fs) {
    // fs是bone的fs对象
};
```

下面是所有fs的api列表：

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

#### pathResolve(filePath, dir)

解析文件路径为绝对路径，在bone中除了`./`,`../`,`/`这三种相对路径符号，还添加了`~`符号用来表示项目根目录，项目根目录为`bonefile.js`文件所在目录，项目根目录保存在`bone.status.base`上

bone的所有接口中文件路径都通过`pathResolve`函数来解析，参数dir没有定义的情况下默认为项目根目录，后面的代码没有另外声明情况下项目根目录为`/base/path`

```javascript
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
```

对于绝对路径不影响

```javascript
fs.pathResolve('/base/otherpath');
// return
'/base/otherpath'
```

#### createReadStream(filePath)
创建一个读取虚拟文件或者真实文件的流对象，当读取的文件不存在时会丢出一个错误

```javascript
bone.dest('dist')
    .src('~/main.js')

bone.setup('./');

var stream = fs.createReadStream('~/dist/main.js');
```

通过option可传递act对象，给读取的文件追加处理器

```javascript
var streamAct = fs.createReadStream('~/dist/main.js', {
    act: concat()
});
```

#### mkdir(dir)
创建文件夹，支持递归创建

```javascript
fs.mkdir('~/dist/release/js');
```

#### rm(filePath)
删除文件或文件夹，当传入参数是一个文件夹时会删除其子文件夹及文件

*ps:这个函数非常危险，请确认后再使用*

```javascript
fs.rm('~/dist')
```

#### createWriteStream(filePath, option)

创建一个本地文件的写入流

```javascript
var writeStream = fs.createWriteStream('~/dist/release/js/main.js');
```

如果在一个不存在的文件夹下创建一个写入流函数会丢出一个错误，通过option传递focus参数可以在创建写入流之前创建文件夹

```javascript
var wStream = fs.createWriteStream('~/dist/release/js/main.js', {
    focus: true
});
```

#### readFile(filePath, option, callback)
读取文件，参数同[createReadStream](#createreadstreamfilepath)

```javascript
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

#### writeFile(filePath, callback)
写文件

参数同[createWriteStream()](#createwritestreamfilepath-option)

```javascript
fs.writeFile('~/dist/foo.js', 'hello world', {
    focus: true
});

```

#### search(searchValue, option)
支持[glob](https://github.com/isaacs/node-glob)语法的文件搜索，传入notFs参数仅搜索虚拟文件

```javascript
bone.dest('dist')
    .src([
        '~/src/main.js',
        '~/src/lib/jquery.js'
    ]);

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

#### readDir(dir)
读取文件，传入参数notFs仅读取虚拟文件夹

```javascript
bone.dest('dist')
    .src([
        '~/src/main.js',
        '~/src/lib/jquery.js'
    ]);

fs.readDir('./dist');
// return
['main.js', 'jquery.js']

fs.readDir('~/src', {
    notFs: true
});
// return
[]
```

#### existFile(filePath)
返回文件是否存在，传入参数notFs仅判断虚拟文件

```javascript
bone.dest('dist')
    .src([
        '~/src/main.js',
        '~/src/lib/jquery.js'
    ]);

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