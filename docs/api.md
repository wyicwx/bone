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
文件路径解析为绝对路径

在bone中支持`~`,`./`,`../','/'四种定位方式都通过`pathResolve`函数来解析。
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
####mkdir()
####rm()
####createWriteStream()
####readFile()
####search()
####register()
####refresh()
####readDir()
####existFile()