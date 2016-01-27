新手上路
======

### 环境

+ 安装 [node.js](https://nodejs.org) 环境，要求node版本为0.12及以上
+ [npm](https://www.npmjs.com/) 包管理

### 1. 安装bone-cli模块

在终端/cmd命令行中输入

```shell
$ npm install --global bone-cli
```

使用`--global`参数将`bone-cli`模块安装到npm全局模块中，`bone`作为全局命令行工具在任何路径下可调用

*注：linux/mac系统安装需要root权限，使用`sudo`提权*

`--global`参数请参阅 [install npm packages globally](https://docs.npmjs.com/getting-started/installing-npm-packages-globally) 文档

安装成功后通过终端或cmd命令行输入`bone`命令即可调用bone

```shell
$ bone
> Fatal Error: unable to find bonefile.js file.
```

由于当前文件夹下没有`bonefile.js`的配置文件，所以`bone`命令会抛出一个致命错误，没关系我们一步一步来：）

### 2. 安装bone到你的项目中

切换到项目所在根目录下执行npm命令

```shell
$ npm install bone
```

`bone`是核心模块，`bone-cli`模块会调用本地的`bone`模块

使用`--save`或`--save-dev`参数会将模块信息记录到`package.json`，具体信息请阅读 [npm using a package.json](https://docs.npmjs.com/getting-started/using-a-package.json) 文档

```shell
$ npm install bone --save-dev
```

### 3. 创建配置文件

在项目根目录下创建配置文件`bonefile.js`，`bone-cli`模块读取本地文件夹下的`bonefile.js`文件，根据文件内容对Bone进行配置

linux/mac执行以下命令创建`bonefile.js`文件

```shell
$ touch bonefile.js
```

### 4. 编写配置文件

```javascript
var bone = require('bone');

bone.dest('dist')
    .src('~/src/**/*');
```

配置将项目根目录下src内文件和文件夹都映射到项目根目录的dist文件夹下

关于`dest()`、`src()`的API信息请参阅 [常用API](./api.html)

关于`bonefile.js`更多示例请参阅 [bonefile.js示例](./example.html)

### 5. 安装处理器模块

[bone-act-less]() 是bone的处理器模块，作用是在文件映射过程中对.less文件进行编译

```shell
$ npm install bone-act-less --save-dev
```

修改`bonefile.js`文件，通过`act`函数对对映射文件增加处理器

```javascript
var bone = require('bone');
// 使用bone.require加载
var less = bone.require('bone');

bone.dest('dist')
    .src('~/src/**/*')
    .act(less);
```

关于`act`函数和`处理器`模块的更多信息请参阅 [处理器](./plugins.html)

### 6. 安装cli模块

[bone-cli-build](https://github.com/wyicwx/bone-cli-build) 是bone的cli模块，作用是将虚拟文件系统内文件生成到本地文件系统

```shell
$ npm install bone-cli-build --save-dev
```

修改`bonefile.js`文件，通过`bone.cli`函数加载`bone-cli-build`模块

```javascript
var bone = require('bone');
var less = bone.require('bone');
var build = require('bone-cli-build');

bone.dest('dist')
    .src('~/src/**/*')
    .act(less);

bone.cli(build());
```

关于cli模块的更多信息请参阅 [命令行CLI](./cli.html)

### 7. 调用bone命令查看
```shell
$ bone

> Usage: bone [options] [command]

  Commands:

    build [options] 
       build all file
    

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

执行`bone-cli-build`模块的命令`bone build`，将所有虚拟文件系统内的文件生成到本地文件系统

至此我们配置了一个简单的项目，包含了cli模块和less文件处理模块