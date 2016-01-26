新手上路
======

### 环境

+ 安装 [node.js](https://nodejs.org) 环境，要求node版本为0.12及以上
+ [npm](https://www.npmjs.com/) 包管理

### 1. 安装bone-cli模块

在终端/cmd命令中输入

```nohighlight
$ sudo npm install --global bone-cli
```

使用`--global`参数将`bone-cli`模块安装到npm全局模块中，`bone`作为全局命令行工具在任何路径下可调用

*注：linux/mac系统安装需要root权限，windows系统不需要sudo*

`--global`参数请阅读 [install npm packages globally](https://docs.npmjs.com/getting-started/installing-npm-packages-globally) 文档

安装成功后通过终端或cmd命令行输入`bone`命令即可调用bone

```bash
$ bone
> Fatal Error: unable to find bonefile.js file.
```

由于当前文件夹下没有`bonefile.js`的配置文件，所以`bone`命令会抛出一个致命错误，没关系我们一步一步来：）

### 2. 通过npm安装bone到你的项目中

在项目根目录下执行npm命令

```bash
$ npm install bone
```

`bone`是核心模块，`bone-cli`模块会调用本地的`bone`模块

*注:使用`--save`或`--save-dev`参数将模块信息记录到`package.json`里，具体信息请阅读 [npm using a package.json](https://docs.npmjs.com/getting-started/using-a-package.json) 文档*

### 3. 创建`bonefile.js`

在项目根目录下创建文件`bonefile.js`，`bone-cli`模块读取本地文件夹下的`bonefile.js`文件，根据文件内容对Bone进行配置

### 4. 通过`dest()`定义你的虚拟文件夹

```javascript
var bone = require('bone');

bone.dest('dist')
    .src('~/src/**/*');
```

关于`dest()`、`src()`的API信息请参阅[常用API](./api.html);

### 5. 安装`bone-cli-build`

```javascript
var bone = require('bone');
var build = require('bone-cli-build');

bone.dest('dist')
    .src('~/src/**/*');

bone.cli(build());
```
### 6. 调用bone内置命令`bone build`生成文件
```shell
$ bone build
```
**注**:main.js文件在src文件夹下，通过bone映射到了dist/main.js

### 其他

+ 命令行工具请参考[bone-cli](https://github.com/wyicwx/bone-cli)模块
+ 如何使用并开发自定义[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)