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

使用`act()`函数加载处理器，`act()`函数第一个参数传递给处理器

```javascript
var bone = require('bone');
var less = bone.require('bone-act-less');

bone.dest('dist')
    .src('~/src/less/style.less')
    .act(less);
```

#### 过滤器

部分处理器模块会自带过滤器，只处理对应的文件

```javascript
bone.dest('dist')
    .src('~/src/main.js')
    .act(less); // less处理器只处理.less后缀的文件
```
通过传递filter参数来修改过滤器

```javascript
bone.dest('dist')
    .src('~/src/css/style.css')
    .act(less({}, {
        filter: {
            ext: ['.css']
        }
    }));

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
            // fileInfo = {
            //     
            // }
            return true;
        }
    }));
```

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