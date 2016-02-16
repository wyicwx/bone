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

创建`bonefile.js`后可以通过bone命令查看相应帮助，`bonefile.js`内容可以参阅 [bonefile.js示例](./example.html)

```shell
$ bone --help
>
  Usage: bone [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

### 加载cli模块

通过`bone-cli`加载`bone`，会给`bone`对象添加`bone.cli()`函数，该函数用来扩展`bone`的命令

```javascript
var bone = require('bone');
var connect = require('bone-cli-connect');

bone.cli(connect());
```
通过上面的代码我们载入了`connect`cli模块，再次执行`bone`命令可以看到`connect`模块已经加载到`bone`命令上了

```shell
$ bone
> 
  Usage: bone [options] [command]

  Commands:

    connect [options] 
       Start a connect web server.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

通过执行`bone connect`可以调用`connect`模块

```shell
$ bone connect
```

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

### 自定义命令

`bone.cli()`函数的参数接受传入一个函数，该函数接受三个参数，一个是command函数，执行后会返回一个commander对象，第二个参数是bone对象，第三个参数是bone的fs对象

**注**：commander对象(commander对象是[Commander](https://github.com/tj/commander.js)的一个实例)

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

### 追加act

对于cli内使用[内建api](./inner_api.html)来读取的文件，`bone.cli`提供一个参数来追加act，追加的act会影响整个cli内使用[内建api](./inner_api.html)读取文件的行为

```js
var connect = require('bone-cli-connect');
var uglify = require('bone-act-uglify');

bone.cli(connect(), {
    act: uglify // connect内读取的文件都会追加uglify的act
});

```

`act`参数传递处理器，处理器会改变该命令行的fs api的行为，所有读取的文件最后都会通过该处理器处理


# 可用模块

+ [bone-build](https://github.com/wyicwx/bone-build) 增加build命令支持
+ [bone-cli-connect](https://github.com/wyicwx/bone-cli-connect) 支持bone的api的静态服务器
+ [bone-cli-proxy](https://github.com/wyicwx/bone-cli-proxy) 支持bone的api的代理服务器
