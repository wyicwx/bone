常用API
======

在Bone的虚拟文件系统中，`bone.dest()`函数是所有的文件定义的入口

`bone.dest()`返回一个file对象，该对象用来描述文件的状态，下面是file对象的api列表

+ [dest()](#dest) 定义虚拟文件夹
+ [src()](#src) 指定映射源文件
+ [cwd()](#cwd) 修改cwd
+ [dir()](#dir) 指定文件所在的文件夹
+ [rename()](#rename) 修改虚拟文件名称
+ [act()](#act) 指定处理器处理
+ [temp()](#temp) 临时文件标识

*注：file对象的api允许链式调用*

#### dest

参数类型： `String`

`bone.dest()`函数返回一个file对象，并将参数传递给file对象的`dest()`函数

```javascript
var dist = bone.dest('dist');
```

通过`dest()`定义一个虚拟文件夹，假设项目根目录所在文件夹为`/work/project/`，则我们通过上面的代码定义了`/work/project/dist`的文件夹

*注：项目根目录是bonefile.js文件所在的文件夹*

再次调用`dest()`则是定义该虚拟文件夹下的子虚拟文件夹

```javascript
var dist = bone.dest('dist');
    dist.dest('subfolder');
```

通过上面的代码我们定义了另外一个文件夹`/work/project/dist/subfolder`

对于多层文件夹路径我们也可以直接一次性定义

```javascript
var subfollder = bone.dest('dist/subfolder');
```

当然这些定义的虚拟文件夹在你的文件系统里并不存在，仅仅是保存在内存里的配置而已

#### src

参数类型：`StringArray`、`String`

`src()`函数指定将哪些源文件映射到当前虚拟文件夹下

可以指定单一文件

```javascript
var dist = bone.dest('dist');
dist.src('~/src/main.js');
```
可以使用glob语法，glob语法请参阅 [node-glob](https://github.com/isaacs/node-glob)
```javascript
dist.src('~/src/*.js');
```

```javascript
// 使用数组指定多个文件
dist.src([
    '~/src/main.js',
    '~/src/lib/jquery.js',
    '~/src/page/*.js'
]);
```

假设我们的目录结构是这样的
```fs
┬root
└┬ src
 ├── main.js
 ├─┬ lib
 │ ├── undescore.js
 │ ├── jquery.js
 │ └── backbone.js
 └─┬ page
   ├── index.js
   └── detail.js
```
通过上面的代码我们定义了一个dist文件夹，于是我们的目录结构变成这样
```fs
┬root
├┬dist (虚拟文件夹和虚拟文件)
│├── main.js
│├── jquery.js
│├── index.js
│└── detail.js
│
└┬ src
 ├── main.js
 ├─┬ lib
 │ ├── undescore.js
 │ ├── jquery.js
 │ └── backbone.js
 └─┬ page
   ├── index.js
   └── detail.js
```

*注：`~`符号表示项目根目录*

`src()`函数中的相对路径符号`./`、`../`是相对于所在的虚拟文件夹路径，下面这两种写法相同

```javascript
bone.dest('dist')
    .src('../src/main.js');
```

```javascript
bone.dest('dist')
    .src('~/src/src/main.js');
```

请注意避免定义一个无限递归映射文件，假设在本地文件系统中有这样一个文件`src/main.js`，下面的是错误的定义代码

```javascript
bone.dest('src')
    .src('./main.js');
```

`src()`函数不仅支持映射本地文件还支持虚拟文件的映射，上面的代码对于bone来说，是在src下定义了`main.js`文件，这个文件映射自`src/main.js`文件也就是其自身，从而导致无限递归映射，请避免这样的定义

#### cwd

参数类型：`String`

`cwd()`函数必须在`src()`函数之前调用。该函数用来改变`src()`相对的所在文件夹路径

```javascript
bone.dest('dist')
    .cwd('~/src')
    .src('./main.js');
```

上面的代码改变了`src('./main.js')`的相对路径，src最终指定的是`~/src/main.js`

#### dir

参数类型：`String`、`Function`

`dir()`函数必须在`src()`函数调用之后调用。该函数用来设置映射文件所在的文件夹

```javascript
bone.dest('dist')
    .src('~/src/main.js')
    .dir('subfloder');
```

上面的代码配置了一个虚拟文件`dist/subfloder/main.js`

`dir()`函数和`dest()`函数相同，都是定义虚拟文件夹，不同的是`dir()`函数可以根据映射文件来生成，通过传递函数参数来动态设置文件夹

```javascript
// 项目根目录 /work/project
bone.dest('dist')
    .src('~/src/main.js')
    .dir(function(dir, src, dest) {
        // dir = '';
        // src = '/work/project/src/main.js'
        // dest = '/work/project/dist/main.js'

        return 'subfloder';
    });
```
如果`src()`使用glob语法匹配，则dir默认值为glob匹配的文件夹

```javascript
// 项目根目录 /work/project
// 文件树
// ┬root
// └┬ src
//  └─┬ page
//    ├── index.js
//    └── detail.js

bone.dest('dist')
    .src('~/src/**/*')
    .dir(function(dir, src, dest) { // 对于glob匹配到的文件都会遍历访问`dir()`函数，我们取一个文件为例子
        // dir = 'page'
        // src = '/work/project/src/page/index.js'
        // dest = '/work/project/dist/index.js'

        return ''; // 通过返回空字符串将默认的'page'文件夹取消
    });
```

#### rename

参数类型：`String`、`Function`、`Object`

`rename()`函数必须在`src()`函数调用之后调用。该函数用来修改映射后文件的名称

```javascript
bone.dest('dist')
    .src('~/src/main.js')
    .rename('main.rename.js');
```

通过上面的代码我们配置了一个文件`dist/main.rename.js`映射源文件为`src/main.js`

也支持传递参数对象，下面是使用对象作为参数，name和ext可以同时传递也可以只传递一个

```javascript
bone.dest('dist')
    .src('~/src/main.js')
    .rename({
        name: 'main.rename',
        ext: '.js'
    });
```

对于`src()`使用glob语法匹配的多个文件，请避免使用`String`和`Object`类型，多个文件使用同一名称会造成重复定义文件的错误，多个文件请使用`Function`类型来动态重命名

```javascript
// 项目根目录 /work/project
// 文件树
// ┬root
// └┬ src
//  └─┬ page
//    ├── index.js
//    └── detail.js

bone.dest('dist')
    .src('~/src/**/*')
    .rename(function(fileName, filePath, fileInfo) {
        // fileName = 'index.js'
        // filePath = '/work/project/src/page/index.js'
        // fileInfo = { 
        //    root: '/',
        //    dir: '/work/project/src/page',
        //    base: 'index.js',
        //    ext: '.js',
        //    name: 'index' 
        //  }

        return fileInfo.name + 'rename.js';
    });
```

对于批量修改文件后缀可以使用`extTransport`

```javascript
bone.dest('dist')
    .src('~/src/**/*')
    .rename({
        extTransport: {
            '.less': '.css'
        }
    });
```

*注：若设置了`ext`参数，则`extTransport`参数无效*

#### act

参数类型: `Plugins`

`act()`函数必须在`src()`函数调用之后调用。该函数用来设置文件映射过程中需要进行修改的处理器

```javascript
var bone = require('bone');
var less = bone.require('bone-act-less');

bone.dest('dist')
    .src('~/src/less/style.less')
    .act(less);
```

上面代码使用了`bone-act-less`处理器对less文件进行编译处理

处理器相关的介绍请参阅[处理器](./plugins.html)

#### temp

参数类型： `Boolean`

`temp()`函数用来标志该文件或文件夹是否临时文件，临时文件不会生成到本地文件系统中


```javascript
// 标识为临时文件夹
bone.dest('dist')
    .dest('temp')
    .temp(true);

// 标识为临时文件
bone.dest('dist')
    .src('~/src/temp.js')
    .temp(true);
```