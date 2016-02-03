处理器
=======

处理器是针对文件映射过程中对文件内容进行修改的处理单元

#### 安装处理器

以`bone-act-less`作为例子

```shell
$ npm install bone-act-less --save-dev
```

#### 使用处理器

和`node.js`中加载模块的方式不同，`bonefile.js`里使用`bone.require`函数加载处理器模块

```javascript
var bone = require('bone');
var less = bone.require('bone-act-less');
```

使用`act()`函数加载处理器，`act()`函数可以多次调用来添加多个处理器，处理器的执行顺序和`act()`函数的调用顺序一致

```javascript
var bone = require('bone');
var less = bone.require('bone-act-less');
var cleancss = bone.require('bone-act-cleancss');

bone.dest('dist')
    .src('~/src/less/style.less')
    .act(less)
    .act(cleancss);
```

#### 传递参数给处理器

```javascript
bone.dest('dist')
    .src('~/src/less/style.less')
    .act(less({
        ieCompat: false
    }));
```

#### 过滤器

bone在调用处理器之前会经过过滤器筛选，过滤器通过判断文件的路径信息来决定是否使用该处理器

一般处理器模块内部设置了缺省的过滤器参数，处理器模块可以选择仅处理哪些类型的文件，以`bone-act-less`为例

```javascript
bone.dest('dist')
    .src('~/src/main.js')
    .act(less); // less处理器只处理.less后缀的文件
```
若想自定义处理过滤内容可以通过传递filter参数来修改，自定义的过滤器参数会覆盖缺省的参数

```javascript
bone.dest('dist')
    .src('~/src/css/style.css')
    .act(less({}, {
        filter: {
            ext: ['.css']
        }
    }));
```

`filter`参数也可以传递函数，下面是所有可以传递的数据结构

```javascript
bone.dest('dist')
    .src('~/src/css/style.css')
    .act(less({}, {
        filter: {
            ext: ['.css'], // 优先判断后缀
            name: 'style',
            base: 'style.css'
        }
    }));

bone.dest('dist')
    .src('~/src/css/style.css')
    .act(less({}, {
        filter: function(fileInfo) { 
            //  fileInfo = {
            //      source: '/work/project/src/css/style.css',
            //      sourceParsed: {
            //          root: '/',
            //          dir: '/work/project/src/css',
            //          base: 'style.css',
            //          ext: '.css',
            //          name: 'style' 
            //      },
            //      destination: '/work/project/dist/style.css',
            //      destinationParsed: {
            //          root: '/',
            //          dir: '/work/project/dist',
            //          base: 'style.css',
            //          ext: '.css',
            //          name: 'style'
            //      }
            //  }

            return true;
        }
    }));
```

#### 自定义简易的处理器

若想快速定义一个简易的处理器可以通过`bone.wrapper`函数

```javascript
bone.dest('dist')
    .src('~/src/css/style.css')
    .act(bone.wrapper(function(buffer, encoding, callback) {
        callback(null, buffer);
    }, {
        filter: {
            ext: '.css'
        }
    }));
```
处理器开发相关的文档请参阅[处理器开发](./plugins_dev.html)

常用处理器
=======

+ [bone-act-less](https://github.com/wyicwx/bone-act-less) less编译器
+ [bone-act-sass](https://github.com/jansesun/bone-act-sass) sass编译器
+ [bone-act-concat](https://github.com/wyicwx/bone-act-concat) 文件合并
+ [bone-act-include](https://github.com/wyicwx/bone-act-include) include功能
+ [bone-act-htmllayout](https://github.com/wyicwx/bone-act-htmllayout) 为html文件提供layout功能
+ [bone-act-babel](https://github.com/wyicwx/bone-act-babel) babel
+ [bone-act-uglify](https://github.com/wyicwx/bone-act-uglify) uglify压缩器
+ [bone-act-cleancss](https://github.com/wyicwx/bone-act-cleancss) css压缩器