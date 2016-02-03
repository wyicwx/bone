# 命令行CLI

[bone-cli](https://github.com/wyicwx/bone-cli) 模块是bone的命令行的辅助模块，通过命令行来对bone进行操作，该模块没有集成在bone内部，需要单独安装

### 安装
通过npm安装，这是全局模块，安装后可以在命令行中使用`bone`命令

```sh
$ sudo npm install -g bone-cli
```

**注**：安装到全局需要使用sudo提权

bone-cli会载入你项目目录下的[bone](https://github.com/wyicwx/bone)模块，并拓展bone对象的方法

### bonefile.js文件

`bonefile.js`是配置文件，该文件放在项目根目录下，`bone-cli`自动查找并载入这个文件并使用`bonefile.js`所在的文件夹路径初始化bone

创建`bonefile.js`后可以通过bone命令查看相应帮助
```shell
$ bone --help
>
  Usage: bone [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

### 加载命令行

### 定义任务流

通过`bone.task()`定义任务流，用来将多个需要执行的命令连成一个任务流

```js
bone.task('release', 'rm -rf ./dist/*', {
    exec: 'name',
    params: '~/dist/*'
});
```

上面的配置代码定义了一个release任务流，任务流执行的命令不仅限于Bone自身的命令和任务名，也可以是系统的命令

```sh
$ bone release
```

### 添加自己的命令

通过bone-cli加载bone，会给bone对象添加`bone.cli()`函数，参数接受传入一个函数，该函数接受两个参数，一个是command函数，执行后会返回一个commander对象，另一个参数是bone

**注**：commander对象(commander对象是[Commander](https://github.com/tj/commander.js)的一个实例)

在bonefile.js文件或者独立的模块里内调用`bone.cli()`来定义自己的命令

```js
var bone = require('bone');

bone.cli(function(command, bone, fs) {
    var commander = command('custom');
    
    command('custom')
        .version('0.0.1')
        .option('-f, --foo', 'enable some foo')
        .option('-b, --bar', 'enable some bar')
        .option('-B, --baz', 'enable some baz');
});
```
通过`bone custom --help`查看自定义命令的帮助

### 修改

```js
var connect = require('bone-cli-connect');
var uglify = require('bone-act-uglify');

bone.cli(connect(), {
    act: uglify
});

```

`act`参数传递处理器，处理器会改变该命令行的fs api的行为，所有读取的文件最后都会通过该处理器处理


# 可用模块

+ [bone-build](https://github.com/wyicwx/bone-build) 增加build命令支持
+ [bone-cli-connect](https://github.com/wyicwx/bone-cli-connect) 支持bone的api的静态服务器
+ [bone-cli-proxy](https://github.com/wyicwx/bone-cli-proxy) 支持bone的api的代理服务器
