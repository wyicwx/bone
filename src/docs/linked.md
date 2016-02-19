# 调用任务流

任务流是bone中非常重要的一个特性，任务流和`Grunt`、`Gulp`的任务流概念相同，通过定义一个个的基本的任务单元，依次执行。bone的任务流还提供了调用系统命令的能力。

一个项目往往会有各种各样的辅助脚本，如开发调试、优化压缩、打包部署、在线debug等，不同的脚本可能使用不同的语言实现，也有不同的调用方式，bone提供了一种比较开放的方式能将所有的脚本整合在一起。

`bone-cli`模块提供了`bone.task`函数实现任务流来处理事物，先看看一个例子

这个示例里定义了一个`foo`的任务，这个任务由一个函数组成

一个基本的任务单元由两部分组成，任务名称和处理单元，处理单元可以是字符串、对象、函数，上面的代码中的`foo`任务对应的处理单元是一个函数。

```javascript
var bone = require("bone");

bone.task("foo", function() {
    // do something
});
```

要执行这个任务，通过`bone 任务名`的方式执行这个任务

```sh
$ bone foo
```

任务也可以去调用其他任务，下面的示例定义了一个`bar`任务，依次调用了`bone build`命令和`foo`任务，这里参数使用`build`而不是使用`bone build`，是因为bone已经加载名为`build`的cli

```javascript
var build = require("bone-cli-build");

bone.cli(build());

bone.task("bar", "build", "foo");
```

当然也可以去加载外部的命令，例如系统命令，以`rm`为例子

```javascript
bone.task("bar", "rm -rf ./dist", "build", "foo");
```



```javascript
var bone = require('bone');

bone.task("step1", function() {
    // do something
});

bone.task("step2", function() {
    // do something
});

bone.task("task", "step1", "step2");
```

