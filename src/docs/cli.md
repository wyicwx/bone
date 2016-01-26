# bone-cli
> Bone的命令行工具

### 安装
通过npm安装，这是全局模块，安装后可以在命令行中使用`bone`命令

```sh
$ npm install -g bone-cli
```

**注**：安装到全局需要使用sudo提权

bone-cli会载入你项目目录下的[bone](https://github.com/wyicwx/bone)模块，并拓展bone对象的方法

### 开始

你需要在你的项目的根目录下创建`bonefile.js`文件，bone-cli会自动载入这个文件
```js
var bone = require('bone');
```
**注意**：bonefile.js不需要调用`bone.setup()`来设置bone根目录，bone-cli会使用bonefile.js所在的文件夹路径初始化bone


通过bone命令查看相应帮助
```sh
$ bone --help
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

### 改变自定义命令的行为

```js
var connect = require('bone-cli-connect');
var uglify = require('bone-act-uglify');

bone.cli(connect(), {
    act: uglify
});

```

`act`参数传递处理器，处理器会改变该命令行的fs api的行为，所有读取的文件最后都会通过该处理器处理


### 可用模块

+ [bone-build](https://github.com/wyicwx/bone-build) 增加build命令支持
+ [bone-cli-connect](https://github.com/wyicwx/bone-cli-connect) 支持bone的api的静态服务器
+ [bone-cli-proxy](https://github.com/wyicwx/bone-cli-proxy) 支持bone的api的代理服务器
