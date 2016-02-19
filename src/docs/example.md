# 简易示例

这里提供了一个`bonefile.js`文件的示例

```javascript
var bone = require('bone'); 
var less = bone.require('bone-act-less');

bone.dest("dist")
    .cwd("~/src")
    .src("./**/*")
    .act(less({
        ieCompat: false
    }))
    .rename({
        extTransport: {
            ".less": ".css"
        }
    });

var build = require('bone-cli-build');
bone.cli(build());
```
这个示例依赖下面这些依赖，使用npm单独安装

+ [bone-act-less](https://github.com/wyicwx/bone-act-less)
+ [bone-cli-build](https://github.com/wyicwx/bone-cli-build)
+ [bone-cli-connect](https://github.com/wyicwx/bone-cli-connect)

配置文件里，bone模块需要单独引用

```javascript
var bone = require('bone');
```

像下面的配置，将src下的所有文件和文件夹映射到dist文件夹下

```javascript
bone.dest("dist")
    .cwd("~/src")
    .src("./**/*")
```

act模块需要手动引入，使用`act()`函数来加载，less模块因为自身带有过滤器所以只会处理后缀名为`.less`的文件，`ieCompat`是传递给less模块的参数

```javascript
var less = bone.require('bone-act-less');

bone.dest("dist")
    .cwd("~/src")
    .src("./**/*")
    .act(less({
        ieCompat: false
    }))
```

使用`rename()`函数对文件进行重命名，前面使用less模块对less文件进行了处理，这里通过`extTransport`参数对修改后缀为`.less`的文件为`.css`后缀

```javascript
bone.dest("dist")
    .cwd("~/src")
    .src("./**/*")
    .act(less({
        ieCompat: false
    }))
    .rename({
        extTransport: {
            ".less": ".css"
        }
    });
```

单独加载build模块，通过`bone.cli()`函数进行加载，加载后可以使用`bone build`命令将所有文件生成到本地

```javascript
var build = require('bone-cli-build');
bone.cli(build());
```

上面的示例仅仅能定义文件和生成文件，并不是合适用来开发，在本机开发需要单独加载connect模块，connect也是cli模块，通过`bone.cli()`函数进行加载，加载后可以使用`bone connect`命令开启本地资源服务器

```javascript
var connect = require('bone-cli-connect');
bone.cli(connect({
    base: "./dist",
    livereload: true
}));
```

如果你需要调用第三方命令可以使用`bone.task`，这里以调用grunt为例，定义一个release任务，依次执行`bone build`，`grunt`命令。

在task的参数中，使用`build`而不是`bone build`是因为`build`是已经加载的cli命令，bone会自动去查找是否是bone已有的命令，若不是bone的cli或task的命令则作为系统命令去调用，为了保证bone本身进程安全，使用子进程来调用

```javascript
bone.task('release', 'build', 'grunt');
```

完整的示例如下

```javascript
var bone = require('bone'); 
var less = bone.require('bone-act-less');

bone.dest("dist")
    .cwd("~/src")
    .src("./**/*")
    .act(less({
        ieCompat: false
    }))
    .rename({
        extTransport: {
            ".less": ".css"
        }
    });

var build = require('bone-cli-build');
bone.cli(build());

var connect = require('bone-cli-connect');
bone.cli(connect({
    base: "./dist",
    livereload: true
}));

bone.task('release', 'build', 'grunt');
```